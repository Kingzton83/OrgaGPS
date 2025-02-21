# views.py

from rest_framework import generics
from .models import CustomUser, Location, Schedule, Task, Job
from locations.serializers import LocationSerializer
from custom_calendar.serializers import ScheduleSerializer
from .serializers import CustomUserSerializer, TaskSerializer, JobSerializer
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.views import View


class CSRFTokenView(View):
    def get(self, request, *args, **kwargs):
        csrf_token = get_token(request)
        return JsonResponse({"csrfToken": csrf_token})

class CustomUserListCreateView(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

class CustomUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

class LocationListCreateView(generics.ListCreateAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

class LocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

class ScheduleListCreateView(generics.ListCreateAPIView):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer

class ScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer

class TaskListCreateView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def perform_create(self, serializer):
        instance = serializer.save(product_owner=self.request.user)
        if instance.assigned_to.exists():
            instance.scrum_master = instance.assigned_to.all()[0]
            instance.save()

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer

    def get_queryset(self):
        qs = Job.objects.all().prefetch_related('assigned_to')
        task_id = self.request.query_params.get('task')
        if task_id:
            qs = qs.filter(task__id=task_id)
        return qs

    def perform_create(self, serializer):
        job = serializer.save()
        job.refresh_from_db()


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer