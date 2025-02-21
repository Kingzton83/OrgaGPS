from datetime import timedelta
from corsheaders.defaults import default_headers
import os
from dotenv import load_dotenv
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
import sys

print(sys.executable)
# Lade die Umgebungsvariablen aus der .env-Datei
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=os.path.join(BASE_DIR, '.env'))

def get_env_variable(var_name, default=None):
    try:
        return os.environ[var_name]
    except KeyError:
        if default is not None:
            return default
        raise ImproperlyConfigured(f"Set the {var_name} environment variable.")

SECRET_KEY = get_env_variable("DJANGO_SECRET_KEY")

ALLOWED_HOSTS = [
    "orgagps.com",
    "10.0.1.99",
    "3.122.194.97",
    "localhost",
    "localhost:3000",
    "localhost:8000",
    "127.0.0.1",
    "web",
    "container-backend",
    "10.0.2.2:8000",
    "10.0.2.2:8081",
    "*",
    "192.168.197.149",
    "192.168.197.149:8000",
    "192.168.197.149:8081",
    "meineapp.127.0.0.1.nip.io:3000",
    "meineapp.127.0.0.1.nip.io:8000",
    "meineapp.127.0.0.1.nip.io",
]

BACKEND_DOMAIN = get_env_variable("BACKEND_DOMAIN", "http://localhost:8000")
FRONTEND_URL = get_env_variable("FRONTEND_URL", "http://localhost:3000")

ACCOUNT_AUTHENTICATION_METHOD = "email"

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = list(default_headers) + [
    "authorization",
    "x-csrftoken",
]
CORS_ALLOWED_ORIGINS = [
    "https://orgagps.com",
    "http://orgagps.com",
    "https://www.orgagps.com",
    "http://www.orgagps.com",
    "http://localhost:3000",
    "http://10.0.2.2:8081",
    "http://localhost:8081",
    "http://10.0.2.2:8000",
    "http://localhost:8000",
    "http://192.168.197.149:8000",
    "http://192.168.197.149:8081",
    "http://meineapp.127.0.0.1.nip.io:3000",
    "http://meineapp.127.0.0.1.nip.io:8000",
    "http://meineapp.127.0.0.1.nip.io",
]

CSRF_TRUSTED_ORIGINS = [
    "https://orgagps.com",
    "http://orgagps.com",
    "https://www.orgagps.com",
    "http://www.orgagps.com",
    "http://localhost:3000",
    "http://10.0.2.2:8081",
    "http://localhost:8081",
    "http://10.0.2.2:8000",
    "http://localhost:8000",
    "http://*",
    "http://192.168.197.149:8000",
    "http://192.168.197.149:8081",
    "http://meineapp.127.0.0.1.nip.io:3000",
    "http://meineapp.127.0.0.1.nip.io:8000",
    "http://meineapp.127.0.0.1.nip.io",
]

CSRF_COOKIE_HTTPONLY = False
CSRF_HEADER_NAME = "HTTP_X_CSRFTOKEN"
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "accounts",
    "db",
    "locations",
    "custom_calendar",
    "corsheaders",
    "drf_spectacular",
]

SITE_ID = 1
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_EMAIL_VERIFICATION = "none"

# JWT-Einstellungen (ohne dj-rest-auth)
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": None,
    "AUDIENCE": None,
    "ISSUER": None,
    "JWK_URL": None,
    "LEEWAY": 0,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",
}

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    # "allauth.account.middleware.AccountMiddleware", # Entfernen falls Allauth nicht benötigt
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

ROOT_URLCONF = "orgagps.urls"
WSGI_APPLICATION = "orgagps.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "orgagpsdatabase",
        "USER": "admin",
        "PASSWORD": "",
        "HOST": "db",
        "PORT": "5432",
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = "smtp.ionos.de"
EMAIL_PORT = "587"
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "info@orgagps.com"
EMAIL_HOST_PASSWORD = ""

DEFAULT_FROM_EMAIL = "noreply@orgagps.com"
EMAIL_SUBJECT_PREFIX = "[Orgagps] "

LOGOUT_REDIRECT_URL = "/"
LOGIN_REDIRECT_URL = "/"
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")
AUTH_USER_MODEL = "db.CustomUser"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "accounts.authentication.CustomJWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{asctime}] {levelname} {name} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
            "level": "DEBUG",
        },
        "file": {
            "class": "logging.FileHandler",
            "filename": "/tmp/debug.log",
            "formatter": "verbose",
            "level": "DEBUG",
        },
    },
    "root": {
        "handlers": ["console", "file"],
        "level": "DEBUG",
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": True,
        },
        "accounts": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}


DEBUG = True
