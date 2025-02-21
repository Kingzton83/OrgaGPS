# backend/accounts/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from db.models import BlacklistedToken
from rest_framework.exceptions import AuthenticationFailed

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            print("No Authorization header found.")
            return None

        raw_token = self.get_raw_token(header)
        if not raw_token:
            print("No token found in the header.")
            return None

        print(f"Token received: {raw_token}")
        if BlacklistedToken.objects.filter(token=raw_token).exists():
            print("Token has been blacklisted.")
            raise AuthenticationFailed("Token has been revoked")

        return super().authenticate(request)
