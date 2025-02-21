import logging
import requests
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser, MultiPartParser

from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from django.contrib.auth import login
from django.contrib.auth.hashers import check_password
from django.contrib.sites.shortcuts import get_current_site
from django.contrib.auth.tokens import default_token_generator
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.crypto import get_random_string
from django.utils.decorators import method_decorator
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.conf import settings
from django.core.mail import EmailMessage
from django.http import JsonResponse
from rest_framework import generics, status, views
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.throttling import UserRateThrottle

from .serializers import CurrentUserSerializer, RegistrationSerializer, UserInfosSerializer, PasswordResetSerializer, PasswordResetRequestSerializer, CustomLoginSerializer, CustomTokenObtainPairSerializer, ActivateAccountSerializer
from .permissions import CanAddCustomUser, CanEditCustomUser, CanDeleteCustomUser
from .tasks import check_and_delete_unactivated_user
from db.models import CustomUser
from orgagps.tokens import account_activation_token

# Konfiguriere den Logger
logger = logging.getLogger(__name__)

User = get_user_model()


class LoginView(APIView):
    permission_classes = []

    def post(self, request, *args, **kwargs):
        # 1) hCAPTCHA-Validierung
        captcha_response = request.data.get('h-captcha-response')
        if not captcha_response:
            return Response({"error": "hCAPTCHA not provided."}, status=status.HTTP_400_BAD_REQUEST)

        secret_key = "ES_8b959fe14a494e7f9fd7a4bcd61442f5"
        verify_url = "https://hcaptcha.com/siteverify"
        data = {'secret': secret_key, 'response': captcha_response}
        hcaptcha_response = requests.post(verify_url, data=data).json()

        if not hcaptcha_response.get('success'):
            return Response({"error": "hCAPTCHA validation failed."}, status=status.HTTP_400_BAD_REQUEST)

        email = request.data.get('email')
        password = request.data.get('password')
        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response(
                {
                    "error": "Your account is not activated yet. Click on the activation link in your email.",
                    "hint": "Please click the activation link in your email or request a new link."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if not user.check_password(password):
            return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
            "tokens": {
                "access": access_token,
                "refresh": str(refresh),
            }
        }, status=status.HTTP_200_OK)
    

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = CurrentUserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

# -------------------------------------------------------------
# Registration & Login Views
# -------------------------------------------------------------

#@method_decorator(csrf_protect, name='dispatch')
class RegisterUserView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [AllowAny]
    parser_classes = [FormParser, MultiPartParser]

    def perform_create(self, serializer):
        # 1) Token aus dem Request holen:
        captcha_response = self.request.data.get('h-captcha-response')
        if not captcha_response:
            raise ValidationError({"error": "hCAPTCHA not provided."})

        # 2) hCAPTCHA-Validierung bei hCaptcha
        secret_key = "ES_8b959fe14a494e7f9fd7a4bcd61442f5"  # Dein hCAPTCHA Secret Key
        verify_url = "https://hcaptcha.com/siteverify"
        data = {
            'secret': secret_key,
            'response': captcha_response
        }

        r = requests.post(verify_url, data=data)
        result = r.json()
        logger.debug("hCAPTCHA response: %s", result)
        
        if not result.get('success'):
            raise ValidationError({"error": "hCAPTCHA validation failed."})
        print(f"Received data: {self.request.data}")
        user = serializer.save(is_active=False)
        check_and_delete_unactivated_user.apply_async((user.pk,), countdown=3600)

        if self.request.data.get("product_owner") == True:
            user.product_owner = True
            user.can_create_admin = True
            user.can_add_customuser = True
            user.can_edit_customuser = True
            user.can_delete_customuser = True
            user.can_add_locations = True
            user.can_edit_locations = True
            user.can_delete_locations = True
            user.can_add_schedule = True
            user.can_edit_schedule = True
            user.can_delete_schedule = True
            user.save()

        token = account_activation_token.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        print(f"Generated UID: {uid}, Token: {token}")

        activation_link = f"http://meineapp.127.0.0.1.nip.io:3000/activate?uidb64={uid}&token={token}"

        email_subject = "Activate Your Account"
        email_body = f"""
        Hello,

        Please activate your account using the following link:
        
        {activation_link}

        This link will expire in 60 minutes.
        """

        email = EmailMessage(subject=email_subject, body=email_body, to=[user.email])
        email.send()

# -------------------------------------------------------------

@method_decorator(csrf_exempt, name='dispatch')
class ActivateAccountView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uidb64')
        token = request.data.get('token')

        if not uidb64 or not token:
            return Response({"error": "Missing uid or token."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid activation data"}, status=status.HTTP_400_BAD_REQUEST)

        if not account_activation_token.is_token_valid_and_not_expired(user, token):
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = True
        user.product_owner = True
        user.can_create_admin = True
        user.can_add_customuser = True
        user.can_edit_customuser = True
        user.can_delete_customuser = True
        user.can_add_locations = True
        user.can_edit_locations = True
        user.can_delete_locations = True
        user.can_add_schedule = True
        user.can_edit_schedule = True
        user.can_delete_schedule = True
        user.save()

        return Response({"message": "Account activated successfully."}, status=status.HTTP_200_OK)

# -------------------------------------------------------------

class ResendActivationLinkView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        captcha_response = request.data.get("h-captcha-response")
        if not captcha_response:
            return Response({"error": "hCAPTCHA not provided."}, status=status.HTTP_400_BAD_REQUEST)

        secret_key = "ES_8b959fe14a494e7f9fd7a4bcd61442f5"
        verify_url = "https://hcaptcha.com/siteverify"
        res = requests.post(verify_url, data={"secret": secret_key, "response": captcha_response}).json()

        if not res.get("success"):
            return Response({"error": "hCAPTCHA validation failed."}, status=status.HTTP_400_BAD_REQUEST)

        email = request.data.get("email", "").strip().lower()  # Whitespace entfernen, Email klein schreiben
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "No user found with this email."}, status=status.HTTP_404_NOT_FOUND)

        if user.is_active:
            return Response({"error": "This account is already active."}, status=status.HTTP_400_BAD_REQUEST)

        user.last_login = timezone.now()
        user.save()

        token = account_activation_token.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        activation_link = f"http://meineapp.127.0.0.1.nip.io:3000/activate?uidb64={uid}&token={token}"

        email_subject = "Your new Activation Link"
        email_body = f"""
        Hello,

        As requested, here is your new activation link:
        
        {activation_link}

        This link will expire in 60 minutes (the old link is now invalid).
        """
        mail = EmailMessage(subject=email_subject, body=email_body, to=[user.email])
        mail.send()

        return Response({"message": "A new activation link has been sent to your email."}, status=status.HTTP_200_OK)

# -------------------------------------------------------------
# Password Reset Views
# -------------------------------------------------------------
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)

        token = account_activation_token.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_link = f"http://meineapp.127.0.0.1.nip.io:3000/password-reset?uidb64={uid}&token={token}"
        
        email_subject = "Reset Your Password"
        email_body = f"Hello,\n\nPlease click the following link to reset your password:\n{reset_link}\n\nThis link will expire in 60 minutes."
        
        email_message = EmailMessage(subject=email_subject, body=email_body, to=[user.email])
        email_message.send()
        
        return Response({"message": "Password reset link sent."}, status=status.HTTP_200_OK)



class AdminPasswordResetView(views.APIView):
    permission_classes = [CanEditCustomUser]

    def post(self, request, user_id):
        try:
            user = CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        new_password = get_random_string(length=12)
        user.set_password(new_password)
        user.first_login = True
        user.save()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        email_subject = "Your New Access Token"
        email_body = f"""
        Hello {user.first_name},

        Your new access token is: {access_token}
        
        Please contact support if you did not request this.
        """

        email = EmailMessage(subject=email_subject, body=email_body, to=[user.email])
        email.send()

        return Response({"message": "New password set and access token sent to user."}, status=status.HTTP_200_OK)

# -------------------------------------------------------------

class PasswordResetConfirmView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)

# -------------------------------------------------------------
# User Management Views
# -------------------------------------------------------------
class UserInfosView(generics.RetrieveUpdateAPIView):
    serializer_class = UserInfosSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class CreateUserView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [IsAuthenticated, CanAddCustomUser]

    def perform_create(self, serializer):
        user = serializer.save(is_active=False)

        if not self.request.user.can_create_admin:
            user.can_add_customuser = False
            user.can_edit_customuser = False
            user.can_delete_customuser = False
            user.can_add_locations = False
            user.can_edit_locations = False
            user.can_delete_locations = False
            user.can_add_schedule = False
            user.can_edit_schedule = False
            user.can_delete_schedule = False
            user.can_create_admin = False

        user.save()

    
class EditUserView(generics.UpdateAPIView):
    serializer_class = UserInfosSerializer
    permission_classes = [CanEditCustomUser]
    queryset = CustomUser.objects.all()

class DeleteUserView(generics.DestroyAPIView):
    permission_classes = [CanDeleteCustomUser]
    queryset = CustomUser.objects.all()


# -------------------------------------------------------------
# Utility Views
# -------------------------------------------------------------
def health(request):
    return JsonResponse({"status": "ok"})
