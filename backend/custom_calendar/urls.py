from django.urls import path
from .views import UserScheduleListView, CreateScheduleView, EditScheduleView, DeleteScheduleView, MarkAttendanceView

urlpatterns = [
    path('user_schedule_list/', UserScheduleListView.as_view(), name='user_schedule_list'),  # Alle Termine des Benutzers abrufen
    path('create/', CreateScheduleView.as_view(), name='create_schedule'),  # Neues Event erstellen
    path('edit/<int:schedule_id>/', EditScheduleView.as_view(), name='edit_schedule'),  # Event bearbeiten
    path('delete/<int:schedule_id>/', DeleteScheduleView.as_view(), name='delete_schedule'),  # Event löschen
    path('mark-attendance/<int:schedule_id>/', MarkAttendanceView.as_view(), name='mark-attendance'),
]
