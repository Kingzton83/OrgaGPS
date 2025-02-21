# locations/views.py
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import LocationSerializer
from db.models import Location
from rest_framework.generics import ListAPIView, CreateAPIView, DestroyAPIView
from rest_framework.exceptions import PermissionDenied, NotFound
from drf_spectacular.utils import extend_schema

class CreateLocationView(CreateAPIView):
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated]
    queryset = Location.objects.all()

    def perform_create(self, serializer):
        # Check if the user has the permission to add a location
        if not hasattr(self.request.user, 'permissions') or not self.request.user.permissions.can_add_location:
            raise PermissionDenied("Unauthorized. You do not have permission to add locations.")
        serializer.save()

class ListLocationsView(ListAPIView):
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated]
    queryset = Location.objects.all()  # Fetches all Location instances


class EditLocationView(generics.UpdateAPIView):
    """
    Class-based view to edit a location by its ID.
    """
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        # Check if the user has permission to edit locations
        if not hasattr(request.user, 'permissions') or not request.user.permissions.can_edit_location:
            raise PermissionDenied("You do not have permission to edit locations.")

        try:
            instance = self.get_object()
        except Location.DoesNotExist:
            raise NotFound("Location not found.")

        # Partially update the location with the provided data
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(exclude=True)
class DeleteLocationView(DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Location.objects.all()

    def get_object(self):
        """Retrieve the specific location object."""
        try:
            location = super().get_object()
        except Location.DoesNotExist:
            raise NotFound("Location not found.")
        return location

    def perform_destroy(self, instance):
        """Check permissions before deleting the location."""
        if not hasattr(self.request.user, 'permissions') or not self.request.user.permissions.can_delete_location:
            raise PermissionDenied("Unauthorized. You do not have permission to delete locations.")
        instance.delete()
