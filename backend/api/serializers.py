from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Account
from . import models

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ('id', 'first_name','last_name', 'email')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Account
        fields = ('email',  'first_name', 'last_name','password')

    def create(self, validated_data):
        user = Account.objects.create(
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
    
    
class GiftCardTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.GiftCardTransaction
        fields = '__all__'
class GiftCardTransactionOrderProductSerialixer(serializers.ModelSerializer):
    class Meta:
        model=models.GiftCardTransactionOrderProduct
        fields='__all__'
class PaymentDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PaymentDetails
        fields = '__all__'

class UserDeviceGiftCardPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.UserDeviceGiftCardPayment
        fields = '__all__'
        
class TransactionProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.TransactionProduct
        fields = '__all__'
        
class CardRedeemCodeSerializer(serializers.ModelSerializer):
     class Meta:
        model = models.CardRedeemCode
        fields = '__all__'
    
