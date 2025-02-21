# urls.py

from django.urls import path
from django.http import JsonResponse

from .views import (
    CustomUserListCreateView,
    CustomUserDetailView,
    LocationListCreateView,
    LocationDetailView,
    ScheduleListCreateView,
    ScheduleDetailView,
    CSRFTokenView,
    TaskListCreateView,
    TaskDetailView,
    JobListCreateView,
    JobDetailView,
)

def csrf_token_view(request):
    return JsonResponse({'csrfToken': request.META.get('CSRF_COOKIE', '')})


urlpatterns = [
    # CustomUser URLs
    path('users/', CustomUserListCreateView.as_view(), name='user-list-create'),
    path('users/<uuid:pk>/', CustomUserDetailView.as_view(), name='user-detail'),

    # Location URLs
    path('locations/', LocationListCreateView.as_view(), name='location-list-create'),
    path('locations/<uuid:pk>/', LocationDetailView.as_view(), name='location-detail'),

    # Schedule URLs
    path('schedules/', ScheduleListCreateView.as_view(), name='schedule-list-create'),
    path('schedules/<uuid:pk>/', ScheduleDetailView.as_view(), name='schedule-detail'),

    # Task URLs
    path('tasks/', TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<uuid:pk>/', TaskDetailView.as_view(), name='task-detail'),

    path('jobs/', JobListCreateView.as_view(), name='job-list-create'),
    path('jobs/<uuid:pk>/', JobDetailView.as_view(), name='job-detail'),
    
    # csrf
    path('csrf-token/', CSRFTokenView.as_view(), name='csrf'),
]
