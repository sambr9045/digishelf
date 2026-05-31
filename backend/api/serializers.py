from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Account
from . import models

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ('id', 'first_name','last_name', 'email', 'phone_number')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Account
        fields = ('email',  'first_name', 'last_name','password')

    def validate_email(self, value):
        return Account.objects.normalize_email((value or "").strip()).lower()

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        return Account.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            auth_type='email',
            email_verified=False,
            is_active=False,
        )

    def update(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.auth_type = 'email'
        instance.email_verified = False
        instance.is_active = False

        password = validated_data.get('password')
        if password:
            instance.set_password(password)

        instance.save()
        return instance
    
    
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


class AnalyticsEventSerializer(serializers.Serializer):
    session_key = serializers.CharField(max_length=120)
    event_type = serializers.CharField(max_length=64)
    page_path = serializers.CharField(max_length=500, required=False, allow_blank=True, allow_null=True)
    page_title = serializers.CharField(max_length=250, required=False, allow_blank=True, allow_null=True)
    product_id = serializers.CharField(max_length=120, required=False, allow_blank=True, allow_null=True)
    product_name = serializers.CharField(max_length=250, required=False, allow_blank=True, allow_null=True)
    quantity = serializers.IntegerField(required=False, min_value=0, default=0)
    duration_seconds = serializers.IntegerField(required=False, min_value=0, default=0)
    cart_item_count = serializers.IntegerField(required=False, min_value=0, default=0)
    cart_total_quantity = serializers.IntegerField(required=False, min_value=0, default=0)
    cart_total_value = serializers.DecimalField(required=False, max_digits=12, decimal_places=2, default="0.00")
    metadata = serializers.JSONField(required=False, default=dict)


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Contact
        fields = ("name", "email", "message")


class AdminContactSerializer(serializers.ModelSerializer):
    is_new = serializers.SerializerMethodField()
    is_replied = serializers.SerializerMethodField()

    class Meta:
        model = models.Contact
        fields = (
            "id",
            "name",
            "email",
            "message",
            "read_at",
            "reply_message",
            "replied_at",
            "replied_by",
            "created_at",
            "is_new",
            "is_replied",
        )

    def get_is_new(self, obj):
        return obj.read_at is None

    def get_is_replied(self, obj):
        return obj.replied_at is not None
        
