from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Account

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ('id', 'first_name','last_name', 'email')
