from django.contrib import admin
from db.models import CustomUser, Location, Schedule, BlacklistedToken

# Benutzerdefinierte Admin-Klassen
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_active', 'product_owner')
    search_fields = ('email', 'first_name', 'last_name')
    list_filter = ('is_active', 'product_owner')

class LocationAdmin(admin.ModelAdmin):
    list_display = ('location_name', 'location_city', 'location_country', 'product_owner')
    search_fields = ('location_name', 'location_city', 'product_owner__email')
    list_filter = ('location_country',)

class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('event_name', 'start_time', 'end_time', 'user', 'location', 'product_owner')
    search_fields = ('event_name', 'user__email', 'location__location_name', 'product_owner__email')
    list_filter = ('user', 'location', 'product_owner')

class UserGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'workzone', 'product_owner')
    search_fields = ('name', 'workzone__name', 'product_owner__email')
    list_filter = ('workzone',)

class BlacklistedTokenAdmin(admin.ModelAdmin):
    list_display = ('token', 'created_at')
    search_fields = ('token',)
    list_filter = ('created_at',)

# Modelle im Admin-Interface registrieren
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Location, LocationAdmin)
admin.site.register(Schedule, ScheduleAdmin)
admin.site.register(BlacklistedToken, BlacklistedTokenAdmin)
