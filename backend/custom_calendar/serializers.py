from rest_framework import serializers
from db.models import Schedule, Location
from locations.serializers import LocationSerializer  # Bereits vorhandener Serializer für Location

class ScheduleSerializer(serializers.ModelSerializer):
    location = LocationSerializer(required=False)  # Location kann entweder über ID oder Details übermittelt werden
    location_id = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all(), source='location', required=False, write_only=True)

    class Meta:
        model = Schedule
        fields = '__all__'
        
    def create(self, validated_data):
        location_data = validated_data.pop('location', None)
        
        # Location entweder über ID oder Daten erstellen/abrufen
        if location_data:
            location_serializer = LocationSerializer(data=location_data)
            location_serializer.is_valid(raise_exception=True)
            location = location_serializer.save()
            validated_data['location'] = location
        
        return super().create(validated_data)



class MarkAttendanceSerializer(serializers.Serializer):
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()

class DeleteScheduleViewSerializer(serializers.Serializer):
    pass