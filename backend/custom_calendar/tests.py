from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.core.management import call_command
from db.models import Schedule, CustomUser, Workzone
from django.utils import timezone

class ScheduleViewTest(TestCase):
    fixtures = ['fixtures/customuser.json', 'fixtures/locations.json', 'fixtures/schedules.json', 'fixtures/permissions.json']

    @classmethod
    def setUpTestData(cls):
        call_command('loaddata', 'fixtures/customuser.json')
        call_command('loaddata', 'fixtures/locations.json')
        call_command('loaddata', 'fixtures/schedules.json')
        call_command('loaddata', 'fixtures/permissions.json')

    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.get(id=1)
        self.client.force_authenticate(user=self.user)

        # Workzone erstellen und dem Benutzer zuweisen
        self.workzone = Workzone.objects.create(
            name="Test Workzone",
            address1="123 Test Street",
            city="Test City",
            country="Test Country",
            distance_unit="m"
        )
        self.user.workzones.add(self.workzone)


    def test_user_permissions(self):
        permissions = self.user.permissions
        self.assertTrue(permissions.can_add_schedule)
        self.assertTrue(permissions.can_edit_schedule)
        self.assertTrue(permissions.can_delete_schedule)

    def test_edit_schedule_view(self):
            """Testet die Bearbeitung eines Schedules."""
            schedule = Schedule.objects.get(id=1)
            updated_data = {
                "event_name": "Updated Event Name",
                "description": "Updated description."
            }
            response = self.client.put(
                reverse('edit_schedule', kwargs={'schedule_id': schedule.id}),
                data=updated_data,
                format='json'
            )
            print("Response Status Code:", response.status_code)
            print("Response Data:", response.data)
            self.assertEqual(response.status_code, 200)
    
    def test_delete_schedule_view(self):
        """Testet das Löschen eines Schedules."""
        print("Can delete schedule:", self.user.permissions.can_delete_schedule)  # Debugging
        schedule = Schedule.objects.get(id=1)
        response = self.client.delete(
            reverse('delete_schedule', kwargs={'schedule_id': schedule.id})
        )
        print("Response Status Code:", response.status_code)
        print("Response Data:", response.data)  # Debugging
        self.assertEqual(response.status_code, 204)

    def test_mark_attendance_view(self):
        """Testet das Markieren der Anwesenheit für einen Schedule."""
        print("User Workzones:", self.user.workzones.all())  # Debugging
        schedule = Schedule.objects.get(id=1)
        loc_gps_data = schedule.location.location_gps_data.split(',')
        test_data = {
            'latitude': float(loc_gps_data[0]),
            'longitude': float(loc_gps_data[1])
        }
        response = self.client.post(
            reverse('mark_attendance', kwargs={'schedule_id': schedule.id}),
            data=test_data,
            format='json'
        )
        print("Response Status Code:", response.status_code)
        print("Response Data:", response.data)
        self.assertEqual(response.status_code, 200)
        self.assertIn("distance", response.data)  # Überprüft, ob die Entfernung in der Antwort enthalten ist.
        self.assertIn("punctual", response.data)  # Überprüft, ob Pünktlichkeit in der Antwort enthalten ist.
