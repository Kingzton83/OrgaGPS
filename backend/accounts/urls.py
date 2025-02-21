# accounts/urls.py
from django.urls import path
from .views import LoginView, PasswordResetRequestView, PasswordResetConfirmView, CurrentUserView, RegisterUserView, ActivateAccountView, ResendActivationLinkView, CreateUserView, EditUserView, DeleteUserView, health

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('activate/', ActivateAccountView.as_view(), name='activate'),
    path('resend-activation/', ResendActivationLinkView.as_view(), name='resend_activation'),
    path('createuser/', CreateUserView.as_view(), name='create_user'),
    path('edituser/<int:pk>/', EditUserView.as_view(), name='edit_user'),
    path('delete/<uuid:pk>/', DeleteUserView.as_view(), name='delete_user'),
    path('health/', health, name='health_check'),
    path('login/', LoginView.as_view(), name='custom-login'),       
    path('user/', CurrentUserView.as_view(), name='current-user'),
    path('password-reset-request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    ]
