import logging
import re
from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from db.models import CustomUser
from orgagps.tokens import account_activation_token


User = get_user_model()


# -------------------------------------------------------------
# Login Serializer
# -------------------------------------------------------------
class CustomLoginSerializer(serializers.Serializer):
    """
    Verarbeitet Login-Daten (E-Mail und Passwort) und erstellt
    bei Erfolg JWT-Token (Refresh + Access).
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if not email or not password:
            raise serializers.ValidationError('Must include "email" and "password".')

        user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password
        )
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_active:
            raise serializers.ValidationError('User is not active.')

        attrs['user'] = user
        return attrs

    def get_tokens_for_user(self, user):
        """
        Erstellt Refresh- und Access-Token für den Benutzer.
        """
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    

class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "email", "first_name", "last_name", "image"]

# -------------------------------------------------------------
# Custom Token Refresh
# -------------------------------------------------------------
class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    """
    Eigenes Serializer für das Refreshen des Tokens. Optional
    kann 'rotate' übergeben werden, um einen neuen Refresh-Token
    zu generieren.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = RefreshToken(attrs['refresh'])

        if self.context['request'].data.get('rotate') is True:
            data['refresh'] = str(refresh)

        return data


# -------------------------------------------------------------
# Custom Token Pair
# -------------------------------------------------------------
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Passt das Standard-TokenObtainPairSerializer an und fügt
    optional zusätzliche Claims (z.B. user.email) hinzu.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
        }
        return data


# -------------------------------------------------------------
# Registration Serializer
# -------------------------------------------------------------
class RegistrationSerializer(serializers.ModelSerializer):
    """
    Dient zur User-Registrierung. Erstellt einen Benutzer,
    setzt password und kann optional product_owner=True
    setzen.
    """
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'password']

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise serializers.ValidationError("Password must contain at least one special character.")
        return value

    def create(self, validated_data):
        try:
            password = validated_data.pop('password')
            user = CustomUser.objects.create_user(
                email=validated_data['email'],
                username=validated_data['email'],
                password=password,
                product_owner=True
            )
            for attr, value in validated_data.items():
                setattr(user, attr, value)
            user.save()
            return user
        except Exception as e:
            logging.error(f"Error creating user: {str(e)}")
            raise serializers.ValidationError("An error occurred while creating the user.")


# -------------------------------------------------------------
# CreateUserSerializer
# -------------------------------------------------------------
class CreateUserSerializer(serializers.ModelSerializer):
    """
    Wird z.B. von Admins oder Product-Ownern genutzt, um
    weitere Benutzer anzulegen (bspw. Mitarbeiter).
    """
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'email', 'password', 'first_name', 'last_name', 'phone1', 'phone2',
            'address1', 'address2', 'zip_code', 'city', 'country', 'birth_date',
            'image', 'first_login', 'product_owner',
            'can_add_customuser', 'can_edit_customuser', 'can_delete_customuser',
            'can_add_locations', 'can_edit_locations', 'can_delete_locations',
            'can_add_schedule', 'can_edit_schedule', 'can_delete_schedule',
            'can_create_admin',
        ]

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['email'],
            password=password,
            product_owner=False  # Default: keine Product-Owner-Rechte
        )
        for attr, value in validated_data.items():
            setattr(user, attr, value)
        user.save()
        return user


# -------------------------------------------------------------
# ActivateAccountSerializer
# -------------------------------------------------------------
class ActivateAccountSerializer(serializers.Serializer):
    """
    Liest uidb64 und token (z.B. aus E-Mail-Link),
    validiert sie und setzt den Benutzer auf is_active=True.
    """
    uidb64 = serializers.CharField()
    token = serializers.CharField()

    def validate(self, data):
        uid = data.get("uidb64")
        token = data.get("token")
        try:
            uid = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            logging.error(f"Invalid UID: {uid}")
            raise serializers.ValidationError("Invalid UID or User does not exist.")

        if not account_activation_token.check_token(user, token):
            logging.warning(f"Invalid or expired token for user {user.id}")
            raise serializers.ValidationError("Invalid or expired token.")

        data['user'] = user
        return data


# -------------------------------------------------------------
# UserInfosSerializer
# -------------------------------------------------------------
class UserInfosSerializer(serializers.ModelSerializer):
    """
    Wird z.B. für das eigene Profil verwendet (Update von
    first_name, last_name, etc.).
    """
    class Meta:
        model = CustomUser
        fields = [
            'image', 'first_name', 'last_name', 'email', 'phone1', 'phone2',
            'address1', 'address2', 'zip_code', 'city', 'country', 'birth_date'
        ]


# -------------------------------------------------------------
# PasswordResetSerializer
# -------------------------------------------------------------
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return value

class PasswordResetSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate(self, data):
        uidb64 = data.get('uidb64')
        token = data.get('token')
        new_password = data.get('new_password')

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except Exception:
            raise serializers.ValidationError("Invalid UID or user does not exist.")

        if not account_activation_token.check_token(user, token):
            raise serializers.ValidationError("Invalid or expired token.")

        data['user'] = user
        return data

    def save(self):
        user = self.validated_data['user']
        new_password = self.validated_data['new_password']
        user.set_password(new_password)
        user.last_login = timezone.now()
        user.save()
        return user