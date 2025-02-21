from datetime import datetime, timedelta
from django.utils import timezone
import calendar
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import ScheduleSerializer, MarkAttendanceSerializer, DeleteScheduleViewSerializer
from db.models import Schedule
import math
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
import logging

logger = logging.getLogger(__name__)

class UserScheduleListView(ListAPIView):
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Retrieve schedules specific to the authenticated user
        return Schedule.objects.filter(user=self.request.user)

class CreateScheduleView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ScheduleSerializer

    def post(self, request, *args, **kwargs):
        # Check user permission
        if not request.user.can_add_schedule:
            return Response(
                {"error": "Unauthorized. You do not have permission to add schedules."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Deserialize and validate the input data
        serializer = ScheduleSerializer(data=request.data)
        if serializer.is_valid():
            # Save the schedule instance, assigning it to the current user
            schedule = serializer.save(user=request.user)

            # Handle recurring events if applicable
            if schedule.is_recurring and schedule.recurrence_days:
                generate_recurring_events_for_month(request.user, schedule)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Helper-Funktion zur Generierung wiederkehrender Ereignisse für den Monat
def generate_recurring_events_for_month(user, schedule):
    today = datetime.today()
    _, last_day = calendar.monthrange(today.year, today.month)
    current_date = today.replace(day=1)
    recurring_events = []

    while current_date.month == today.month:  # Sicherstellen, dass der Monat nicht überläuft
        # Prüfen, ob der aktuelle Tag in den gewählten Wochentagen enthalten ist
        if current_date.strftime("%A") in schedule.recurrence_days:
            new_event = Schedule(
                user=user,
                event_name=schedule.event_name,
                start_time=current_date.replace(hour=schedule.start_time.hour, minute=schedule.start_time.minute),
                end_time=current_date.replace(hour=schedule.end_time.hour, minute=schedule.end_time.minute),
                description=schedule.description,
                is_recurring=True,
                recurrence_pattern=schedule.recurrence_pattern,
                recurrence_days=schedule.recurrence_days,
                category=schedule.category
            )
            recurring_events.append(new_event)
        
        current_date += timedelta(days=1)  # Zum nächsten Tag wechseln
    
    # Alle Termine auf einmal speichern
    Schedule.objects.bulk_create(recurring_events)

class EditScheduleView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ScheduleSerializer

    def put(self, request, schedule_id, *args, **kwargs):
        # Check if the user has the required permissions
        if not request.user.can_edit_schedule:
            return Response(
                {"error": "Unauthorized. You do not have permission to edit schedules."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Try to retrieve the schedule for the authenticated user
        try:
            schedule = Schedule.objects.get(id=schedule_id, user=request.user)
        except Schedule.DoesNotExist:
            return Response(
                {"error": "Schedule not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Determine if changes should be applied to all related events
        apply_to_all = request.data.get('apply_to_all', False)

        if apply_to_all and schedule.is_recurring:
            # Update all related recurring events
            related_events = Schedule.objects.filter(
                user=request.user,
                event_name=schedule.event_name,
                recurrence_pattern=schedule.recurrence_pattern,
                recurrence_days=schedule.recurrence_days,
                start_time__month=schedule.start_time.month  # Adjust based on your recurrence logic
            )
            errors = []
            for event in related_events:
                serializer = ScheduleSerializer(event, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                else:
                    errors.append(serializer.errors)
            if errors:
                return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

            return Response({"message": "All related events updated successfully."}, status=status.HTTP_200_OK)

        # Update a single schedule
        serializer = ScheduleSerializer(schedule, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteScheduleView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DeleteScheduleViewSerializer

    def delete(self, request, schedule_id, *args, **kwargs):
        # Check if the user has the required permissions
        if not request.user.can_delete_schedule:
            return Response(
                {"error": "Unauthorized. You do not have permission to delete schedules."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Try to retrieve the schedule for the authenticated user
        try:
            schedule = Schedule.objects.get(id=schedule_id, user=request.user)
        except Schedule.DoesNotExist:
            return Response(
                {"error": "Schedule not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Handle deletion of recurring events based on query parameter
        delete_all_param = request.query_params.get('delete_all', 'false').lower()
        if delete_all_param not in ['true', 'false']:
            return Response(
                {"error": "Invalid value for 'delete_all'. Must be 'true' or 'false'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        delete_all = delete_all_param == 'true'

        if delete_all and schedule.is_recurring:
            # Delete all recurring events for the given schedule
            Schedule.objects.filter(
                user=request.user,
                event_name=schedule.event_name,
                recurrence_pattern=schedule.recurrence_pattern,
                recurrence_days=schedule.recurrence_days,
                start_time__month=schedule.start_time.month
            ).delete()
            return Response(
                {"message": "All recurring events deleted successfully."},
                status=status.HTTP_204_NO_CONTENT
            )

        # Delete the specific schedule
        schedule.delete()
        return Response(
            {"message": "Schedule deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )

def calculate_distance(lat1, lon1, lat2, lon2):
    """Berechnet die Entfernung zwischen zwei GPS-Koordinaten in Metern."""
    R = 6371.0  # Erdradius in Kilometern
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c * 1000  # Rückgabe der Distanz in Metern

class MarkAttendanceView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MarkAttendanceSerializer

    def post(self, request, schedule_id):
        """Markiert die Anwesenheit eines Benutzers basierend auf seinem Standort und der Nähe zur Location."""
        
        # First, validate the input data using the serializer
        serializer = MarkAttendanceSerializer(data=request.data)
        if serializer.is_valid():
            user_lat = serializer.validated_data['latitude']
            user_lon = serializer.validated_data['longitude']
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Retrieve the schedule for the authenticated user
            schedule = Schedule.objects.get(id=schedule_id, user=request.user)
            print(f"Schedule found: {schedule.event_name}")  # Debugging
        except Schedule.DoesNotExist:
            print(f"Schedule with ID {schedule_id} not found for user {request.user.username}")  # Debugging
            return Response({"error": "Schedule not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if the user is associated with any workzones
        user_workzones = request.user.workzones.all()
        print(f"User Workzones: {user_workzones}")  # Debugging
        if not user_workzones.exists():
            return Response({"error": "User is not associated with any workzone."}, status=status.HTTP_400_BAD_REQUEST)

        # We assume the user is associated with one workzone; pick the first
        workzone = user_workzones.first()
        distance_unit = workzone.distance_unit  # 'm' for meters or 'ft' for feet
        print(f"Workzone: {workzone.name}, Distance Unit: {distance_unit}")  # Debugging

        # Extract the location data for the schedule
        if not schedule.location or not schedule.location.location_gps_data:
            print("Location data is missing for this schedule.")  # Debugging
            return Response({"error": "Location data is missing for this schedule."}, status=status.HTTP_400_BAD_REQUEST)

        loc_lat, loc_lon = map(float, schedule.location.location_gps_data.split(','))
        location_radius = float(schedule.location.location_radius)
        print(f"Location GPS: Latitude={loc_lat}, Longitude={loc_lon}, Radius={location_radius}")  # Debugging

        # Convert the radius if the unit is feet
        if distance_unit == 'ft':
            location_radius *= 3.28084  # Convert from meters to feet
            print(f"Converted Location Radius (in feet): {location_radius}")  # Debugging

        # Calculate the distance between the user and the location
        distance = calculate_distance(loc_lat, loc_lon, user_lat, user_lon)
        print(f"Calculated Distance: {distance}")  # Debugging
        if distance > location_radius:
            print("User is outside the allowed radius.")  # Debugging
            return Response({"error": "Outside the allowed radius for attendance."}, status=status.HTTP_403_FORBIDDEN)

        # Mark attendance and record punctuality
        current_time = timezone.now()  # Ensure timezone-aware datetime
        print(f"Current Time (timezone-aware): {current_time}")  # Debugging
        schedule.punctual = current_time <= schedule.start_time_login
        schedule.login_time = current_time
        schedule.save()

        print(f"Attendance marked successfully. Punctual: {schedule.punctual}")  # Debugging

        return Response(
            {
                "status": "Attendance marked successfully.",
                "punctual": schedule.punctual,
                "distance": distance,
                "location_radius": location_radius,
            },
            status=status.HTTP_200_OK
        )
