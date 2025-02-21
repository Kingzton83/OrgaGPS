import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.conf import settings

# Globale Blacklisted Tokens
class BlacklistedToken(models.Model):
    token = models.CharField(max_length=500, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.token

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if not email:
            raise ValueError('Superuser must have an email address')

        return self.create_user(email=email, password=password, **extra_fields)

# Benutzer Modell
class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product_owner = models.BooleanField(default=False)
    first_login = models.BooleanField(default=True)
    image = models.ImageField(upload_to='pics/', null=True, blank=True)
    email = models.EmailField(max_length=200, unique=True)
    phone1 = models.CharField(max_length=200, blank=True, null=True)
    phone2 = models.CharField(max_length=200, blank=True, null=True)
    address1 = models.CharField(max_length=200, blank=True, null=True)
    address2 = models.CharField(max_length=200, blank=True, null=True)
    zip_code = models.CharField(max_length=200, blank=True, null=True)
    city = models.CharField(max_length=200, blank=True, null=True)
    country = models.CharField(max_length=200, blank=True, null=True)
    birth_date = models.DateField(null=True, blank=True)

    # Benutzerberechtigungen
    can_create_admin = models.BooleanField(default=False)
    can_add_customuser = models.BooleanField(default=False)
    can_edit_customuser = models.BooleanField(default=False)
    can_delete_customuser = models.BooleanField(default=False)
    can_add_locations = models.BooleanField(default=False)
    can_edit_locations = models.BooleanField(default=False)
    can_delete_locations = models.BooleanField(default=False)
    can_add_schedule = models.BooleanField(default=False)
    can_edit_schedule = models.BooleanField(default=False)
    can_delete_schedule = models.BooleanField(default=False)
   
    objects = CustomUserManager()

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)

# Standorte (Locations)
class Location(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product_owner = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="locations",
        default=1
    )
    # Entfernt: workzone-FK, da Workzone nicht mehr verwendet wird.
    location_name = models.CharField(max_length=200)
    location_email = models.EmailField(max_length=200, blank=True, null=True)
    location_phone1 = models.CharField(max_length=200, blank=True, null=True)
    location_phone2 = models.CharField(max_length=200, blank=True, null=True)
    location_address1 = models.CharField(max_length=200, blank=True, null=True)
    location_address2 = models.CharField(max_length=200, blank=True, null=True)
    location_zip_code = models.CharField(max_length=200, blank=True, null=True)
    location_city = models.CharField(max_length=200, blank=True, null=True)
    location_country = models.CharField(max_length=200, blank=True, null=True)
    location_gps_data = models.CharField(max_length=100, help_text="Latitude and Longitude in 'lat,lon' format")
    location_radius = models.DecimalField(max_digits=4, decimal_places=1, default=1.0, help_text="Radius in meters")
    location_notes = models.CharField(max_length=500, blank=True, null=True)

# Zeitplan (Schedule)
class Schedule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product_owner = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="schedules_as_owner",
        default=1
    )
    # Der Mitarbeiter, der diese Schicht übernimmt:
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="schedules")
    # Entfernt: workzone-FK, da Workzone nicht mehr verwendet wird.
    event_name = models.CharField(max_length=200)
    start_time = models.DateTimeField(blank=True, null=True)
    start_time_login = models.DateTimeField(blank=True, null=True)
    end_time_login = models.DateTimeField(blank=True, null=True)
    login_time = models.DateTimeField(blank=True, null=True)
    end_time = models.DateTimeField(blank=True, null=True)
    start_time_logout = models.DateTimeField(blank=True, null=True)
    end_time_logout = models.DateTimeField(blank=True, null=True)
    logout_time = models.DateTimeField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, related_name="schedules")
    status = models.CharField(max_length=100, default='white')
    punctual = models.BooleanField(default=False)


class Task(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product_owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="tasks_as_owner"
    )
    assigned_to = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name="tasks"
    )
    # Neuer Feld für den Scrum Master
    scrum_master = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="scrum_tasks"
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=50, default="open")  # z.B. "open", "in progress", "completed"
    contact_person = models.CharField(max_length=200, blank=True, null=True)
    contact_phone = models.CharField(max_length=50, blank=True, null=True)
    contact_email = models.EmailField(max_length=200, blank=True, null=True)
    address = models.CharField(max_length=200, blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title


class TaskAttachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to='task_attachments/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment {self.id}"

class TaskEntry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="entries")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="task_entries"
    )
    entry_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # Falls der Task fortlaufend ist, kann hier ein neues Fälligkeitsdatum gespeichert werden
    new_due_date = models.DateTimeField(blank=True, null=True)
    # Hier kann z. B. ein kurzer Status-Update (wie "in progress", "waiting for feedback", etc.) gespeichert werden
    status_update = models.CharField(max_length=50, blank=True, null=True)
    # Anstelle eines einzelnen Datei-Feldes erlauben wir mehrere Anhänge:
    attachments = models.ManyToManyField(TaskAttachment, blank=True, related_name="task_entries")

    def __str__(self):
        return f"Entry for {self.task.title} at {self.created_at}"


class Job(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="jobs"
    )
    assigned_to = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name="jobs"
    )
    description = models.TextField(blank=True, null=True)
    due_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=50, default="open")  # z.B. "open" oder "done"
    created_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Job for {self.task.title} - {self.status}"