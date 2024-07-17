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
    


class AirtimTopUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.TopupTransaction
        fields = '__all__'
        

class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Cart
        fields = '__all__'
        
    def validate(self, data):
        productId = data.get('productId')
        recipientAmount = data.get('recipientAmount')
        user = self.context['request'].user 
        
        # Check if productId, amount, and user combination already exists
        if models.Cart.objects.filter(productId=productId, recipientAmount=recipientAmount, user=user).exists():
            raise serializers.ValidationError("This productId, recipientAmount, and user combination already exists.")

        return data

    def create(self, validated_data):
        user = self.context['request'].user  # Get user from request context
        validated_data['user'] = user  # Assign the current user to the instance before saving
        return super().create(validated_data)