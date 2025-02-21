from django.urls import path
from . import views
from .views import ListLocationsView, CreateAPIView, DeleteLocationView, EditLocationView

urlpatterns = [
    path('locations/', ListLocationsView.as_view(), name='list_locations'),  # Alle Locations auflisten
    path('locations/create/', CreateAPIView.as_view(), name='create_location'),  # Neue Location erstellen
    path('locations/edit/<int:location_id>/', EditLocationView.as_view(), name='edit_location'),  # Location bearbeiten
    path('locations/delete/<int:pk>/', DeleteLocationView.as_view(), name='delete-location'),  # Location löschen
]
