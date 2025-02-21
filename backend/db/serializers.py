from rest_framework import serializers
from .models import Task, CustomUser, TaskAttachment, TaskEntry, Job

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'  # oder wähle nur die benötigten Felder, z.B. ('id', 'first_name', 'last_name', 'email')

class TaskAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskAttachment
        fields = '__all__'

class TaskEntrySerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    attachments = TaskAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = TaskEntry
        fields = '__all__'


class TaskSerializer(serializers.ModelSerializer):
    assigned_to = CustomUserSerializer(many=True, read_only=True)
    assigned_to_ids = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        many=True,
        write_only=True,
        source="assigned_to"
    )
    product_owner = serializers.PrimaryKeyRelatedField(read_only=True)
    scrum_master = CustomUserSerializer(read_only=True)
    entries = TaskEntrySerializer(many=True, read_only=True)
    jobs = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Task
        fields = '__all__'

    def create(self, validated_data):
        assigned_users = validated_data.pop('assigned_to', [])
        instance = Task.objects.create(**validated_data)
        if assigned_users:
            instance.assigned_to.set(assigned_users)
            # Setze den Scrum Master als den ersten zugewiesenen User
            instance.scrum_master = assigned_users[0]
            instance.save()
        # WICHTIG: Stelle sicher, dass nach dem Speichern die Beziehungen korrekt geladen werden
        instance.refresh_from_db()  
        return instance


class JobSerializer(serializers.ModelSerializer):
    assigned_to = CustomUserSerializer(many=True, read_only=True)
    assigned_to_ids = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        many=True,
        write_only=True,
        source="assigned_to"
    )
    
    class Meta:
        model = Job
        fields = '__all__'

