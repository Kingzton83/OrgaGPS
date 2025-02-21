# orgagps/urls.py

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from .views import github_webhook  # falls du eine github_webhook-View hast
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

def api_root(request):
    """
    Ein einfacher Endpunkt, der eine JSON-Antwort zurückgibt,
    damit du einen Überblick über deine API-Endpoints hast.
    """
    return JsonResponse({
        "message": "Welcome to the Orgagps API",
        "available_endpoints": {
            "admin": "/admin/",
            "accounts": "/api/accounts/",
            "db": "/api/db/",
            "locations": "/api/locations/",
            "calendar": "/api/calendar/",
            "health_check": "/api/accounts/health/",
        }
    })

urlpatterns = [
    # Adminpanel
    path('admin/', admin.site.urls),

    # Beispiel-Webhook (optional)
    path('github-webhook/', github_webhook, name='github-webhook'),

    # Übersichts-Endpunkt (reine Info-Ausgabe, optional)
    path('api_root/', api_root, name='api_root'),

    # Deine Apps/Module
    path('api/accounts/', include('accounts.urls')),
    path('api/db/', include('db.urls')),
    path('api/locations/', include('locations.urls')),
    path('api/calendar/', include('custom_calendar.urls')),

    # OpenAPI / Swagger / Redoc (optional, via drf-spectacular)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Optional SimpleJWT-Routen
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
