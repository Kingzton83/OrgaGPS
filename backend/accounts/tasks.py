from celery import shared_task
from db.models import CustomUser

@shared_task
def check_and_delete_unactivated_user(user_id):
    user = CustomUser.objects.filter(pk=user_id, is_active=False).first()
    if user:
        user.delete()
        return f"Deleted unactivated user {user_id}"
    return f"User {user_id} is already activated or does not exist"
