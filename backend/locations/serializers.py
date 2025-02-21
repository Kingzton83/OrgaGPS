from rest_framework import serializers
from db.models import Location  # Importiere das Location-Modell

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'
