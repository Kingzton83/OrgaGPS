# orgagps/tokens.py
from django.contrib.auth.tokens import PasswordResetTokenGenerator
import time

class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    EXPIRATION_TIME_MINUTES = 60

    def _make_hash_value(self, user, timestamp):
        """
        Baue den Hash so auf, dass Änderungen an user.last_login 
        (oder user.password oder user.is_active) den Token unbrauchbar machen.
        """
        # Falls last_login = None, verwende einen leeren String
        last_login_str = (
            user.last_login.replace(microsecond=0, tzinfo=None).isoformat()
            if user.last_login
            else ""
        )
        return f"{user.pk}{timestamp}{user.is_active}{last_login_str}"

    def is_token_valid_and_not_expired(self, user, token):
        """
        Ruft die Django-eigene check_token auf und prüft zusätzlich,
        ob die Token-Zeit abgelaufen ist (z.B. nach 60 Min).
        """
        print(f"Validating token: {token} for user: {user.email}")
        
        # 1) Basis-Validierung (Signatur usw.)
        if not self.check_token(user, token):
            print("Base check_token failed.")
            return False
        
        # 2) Zeitstempel prüfen (siehe _get_timestamp_from_token)
        try:
            timestamp = self._get_timestamp_from_token(token)
            print(f"Extracted timestamp: {timestamp}")
            if self.is_token_expired(timestamp):
                print("Token is expired based on our custom time limit.")
                return False
            return True
        except Exception as e:
            print(f"Error extracting timestamp: {e}")
            return False

    def is_token_expired(self, timestamp):
        """
        Vergleicht den aus dem Token extrahierten Timestamp mit der aktuellen Zeit
        + EXPIRATION_TIME_MINUTES. Ist die Zeit überschritten, => abgelaufen.
        """
        now = int(time.time())  # aktueller UNIX-Timestamp
        expiration_time = timestamp + self.EXPIRATION_TIME_MINUTES * 60
        return now > expiration_time

    def _get_timestamp_from_token(self, token):
        """
        Zieht aus dem Token den Base36-kodierten Timestamp heraus.
        Der Token-Aufbau von PasswordResetTokenGenerator:
            <token_string>-<base36_timestamp>
        """
        try:
            timestamp_base36 = token.split('-')[-1]
            return int(timestamp_base36, 36)
        except Exception as e:
            print(f"Error parsing token: {e}")
            raise ValueError("Could not extract timestamp from token")

    def check_token(self, user, token):
        # Ruft intern "super().check_token" auf, damit Django seine Standard-Signatur 
        # und Zeitstempel-Checks macht. Anschließend führen wir unsere zusätzlichen 
        # Prüfungen in is_token_valid_and_not_expired aus.
        return super().check_token(user, token)


# Instanz erstellen
account_activation_token = AccountActivationTokenGenerator()
