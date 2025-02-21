import os
import django
from faker import Faker
from random import choice, randint
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'orgagps.settings')
django.setup()

from db.models import Workzone, CustomUser, Location, Schedule, Permissions, UserGroup

faker = Faker()

def create_custom_users(number_of_users=5):
    users = []
    for i in range(number_of_users):
        user = CustomUser.objects.create_user(
            username=faker.unique.user_name(),
            email=faker.unique.email(),
            password=faker.password(),
            product_owner=(i == 0),  # Only the first user is the product owner
            first_login=True,
            phone1=faker.phone_number(),
            phone2=faker.phone_number(),
            address1=faker.address(),
            address2=faker.secondary_address(),
            zip_code=faker.zipcode(),
            city=faker.city(),
            country=faker.country(),
            birth_date=faker.date_of_birth(minimum_age=18, maximum_age=70),
        )
        users.append(user)
    print(f"Created {len(users)} users.")
    return users

def create_workzones(users, number_of_workzones=5):
    workzones = []
    for _ in range(number_of_workzones):
        owner = choice(users)  # Randomly pick a user from the list
        workzone = Workzone.objects.create(
            name=faker.unique.company(),
            address1=faker.address(),
            address2=faker.secondary_address(),
            zip_code=faker.zipcode(),
            city=faker.city(),
            country=faker.country(),
            distance_unit=choice(['m', 'ft']),
            owner=owner
        )
        workzones.append(workzone)
    print(f"Created {len(workzones)} workzones.")
    return workzones

def create_locations(workzones, number_of_locations=10):
    locations = []
    for _ in range(number_of_locations):
        if workzones:
            workzone = choice(workzones)  # Ensure there is a workzone to assign
            location = Location.objects.create(
                location_name=faker.company(),
                location_email=faker.unique.email(),
                location_phone1=faker.phone_number(),
                location_phone2=faker.phone_number(),
                location_address1=faker.address(),
                location_address2=faker.secondary_address(),
                location_zip_code=faker.zipcode(),
                location_city=faker.city(),
                location_country=faker.country(),
                location_gps_data=f"{faker.latitude()},{faker.longitude()}",
                location_radius=Decimal(randint(1, 10)),
                location_notes=faker.sentence(),
                workzone=workzone  # Assigning workzone here
            )
            locations.append(location)
    print("Created locations.")
    return locations

def create_schedules(users, locations):
    if not locations:
        print("No locations available to create schedules.")
        return
    for _ in range(25):
        user = choice(users)
        location = choice(locations)
        if location.workzone:  # Checking if workzone is set
            start_time = timezone.now() + timedelta(days=randint(0, 30))
            end_time = start_time + timedelta(hours=randint(1, 8))

            Schedule.objects.create(
                user=user,
                event_name=faker.catch_phrase(),
                start_time=start_time,
                start_time_login=start_time - timedelta(minutes=randint(1, 30)),
                end_time=end_time,
                start_time_logout=start_time + timedelta(hours=randint(2, 4)),
                end_time_logout=end_time + timedelta(hours=randint(1, 3)),
                logout_time=end_time + timedelta(minutes=randint(30, 90)),
                description=faker.text(max_nb_chars=200),
                location=location,
                workzone=location.workzone  # Confirming workzone is set
            )
        else:
            print(f"Skipped schedule creation for {location.location_name} due to missing workzone.")
    print("Created schedules.")



def create_permissions(users):
    for user in users[:5]:  # Ensure only 5 permissions are created
        if not Permissions.objects.filter(user=user).exists():
            Permissions.objects.create(
                user=user,
                can_add_customuser=faker.boolean(),
                can_edit_customuser=faker.boolean(),
                can_delete_customuser=faker.boolean(),
                can_add_locations=faker.boolean(),
                can_edit_locations=faker.boolean(),
                can_delete_locations=faker.boolean(),
                can_add_schedule=faker.boolean(),
                can_edit_schedule=faker.boolean(),
                can_delete_schedule=faker.boolean(),
            )
        else:
            print(f"Permissions for user {user.id} already exist.")
    print("Assigned permissions.")

def main():
    users = create_custom_users()  # Create users first
    workzones = create_workzones(users)  # Then create workzones for each user
    locations = create_locations(workzones)  # Ensure locations are created with workzones
    create_schedules(users, locations)  # Create schedules using users and locations
    create_permissions(users)  # Assign permissions to some users
    print("Data population complete!")

if __name__ == "__main__":
    main()
