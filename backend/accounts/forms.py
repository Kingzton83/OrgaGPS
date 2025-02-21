from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from db.models import CustomUser

User = get_user_model()

class RegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ['email', 'password1', 'password2']

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError('Email already in use.')
        return email
    
class UserInfosForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = [
            'image', 'first_name', 'last_name', 'email', 'phone1', 'phone2', 
            'address1', 'address2', 'zip_code', 'city', 'country', 'birth_date'
        ]
