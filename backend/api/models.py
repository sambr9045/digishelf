from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.postgres.fields import ArrayField

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class Account(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(_('email address'), unique=True)
    first_name = models.CharField(_('first name'), max_length=30, blank=True, null=True)
    last_name = models.CharField(_('last name'), max_length=30, blank=True, null=True)
    is_active = models.BooleanField(_('active'), default=True)
    is_staff = models.BooleanField(_('staff status'), default=False)
    date_joined = models.DateTimeField(_('date joined'), auto_now_add=True)
    device = models.CharField(max_length=250, default="Web")
    phone_number = models.IntegerField(null=True, blank=True)
    country = models.CharField(default=None, max_length=250, null=True , blank=True)
    email_verified = models.BooleanField(default=False)
    last_login = models.DateTimeField(verbose_name="last login",auto_now_add=True, blank=True, null=True)
    auth_type = models.CharField(max_length=100, default="email", null=False, blank=False)
    
    

    # groups = models.ManyToManyField(
    #     Group,
    #     related_name='Account_set',  # Changed related_name to avoid conflict
    #     blank=True,
    #     help_text=_(
    #         'The groups this user belongs to. A user will get all permissions '
    #         'granted to each of their groups.'
    #     ),
    #     verbose_name=_('groups'),
    # )
    # user_permissions = models.ManyToManyField(
    #     Permission,
    #     related_name='Account_set',  # Changed related_name to avoid conflict
    #     blank=True,
    #     help_text=_('Specific permissions for this user.'),
    #     verbose_name=_('user permissions'),
    # )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        return self.email


class DigiShelfData(models.Model):
        profit_percentage = models.DecimalField(max_digits=5, decimal_places=2) 
        processing_fee = models.DecimalField(max_digits=5, decimal_places=2)
        giftcard_processing_fee = models.DecimalField(max_digits=5, decimal_places=2, default=5)
        


class GiftCardTransaction(models.Model):
    user = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='giftcard_transaction', null=True, blank=True)
    reference = models.TextField(default=None, null=False, blank=False , unique=True)
    # product_name = models.CharField(default=None, max_length=250)
    # product_id = models.CharField(default=None, max_length=250)
    # receiver_currency_code = models.CharField(default=None, max_length=250)
    # recipient_amount =models.DecimalField(max_digits=9, decimal_places=2, default="3.4")
    amount = models.DecimalField(max_digits=9, decimal_places=2)
    country = models.CharField(default=None, max_length=250)
    email =models.EmailField(default=None)
    user_type = models.CharField(default="guest", max_length=250)
    payment_method = models.CharField(default="visa", max_length=250)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'{self.reference} - {self.amount} {self.payment_method}'
    
class GiftCardTransactionOrderProduct(models.Model):
    GiftCardTransaction = models.ForeignKey(GiftCardTransaction, on_delete=models.CASCADE, related_name='transactions_order_product')
    productName = models.CharField(max_length=250, default=None)
    productId = models.IntegerField(default=None)
    quantity = models.IntegerField(default=None)
    recipientAmount = models.DecimalField(max_digits=9, decimal_places=2)
    recipientCurrency = models.CharField(default=None)
    AmountToPay = models.DecimalField(max_digits=9, decimal_places=2)
    currencyToPayIn = models.CharField(default=None, max_length=10)
    img = models.CharField(max_length=250, default=None)
    created_at = models.DateTimeField(auto_now_add=True)


class PaymentDetails(models.Model):
    GiftCardTransaction = models.ForeignKey(GiftCardTransaction, on_delete=models.CASCADE, related_name='transactions_details')
    message = models.CharField(max_length=250)
    status = models.CharField(max_length=250)
    transaction = models.CharField(max_length=250)
    trxref=models.CharField(max_length=250)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'{self.status} - {self.transaction}'
    
class UserDeviceGiftCardPayment(models.Model):
    
    GiftCardTransaction = models.ForeignKey(GiftCardTransaction, on_delete=models.CASCADE, related_name='transactions_details_user_device')
    ip_address = models.CharField(max_length=250, default=None)
    
class TransactionProduct(models.Model):
    GiftCardTransaction = models.ForeignKey(GiftCardTransaction, on_delete=models.CASCADE, related_name='transactions_details_completed')
    transactionId = models.IntegerField(default=None)
    amount = models.DecimalField(max_digits=9,decimal_places=2)
    discount = models.DecimalField(max_digits=9,decimal_places=2)
    currencyCode = models.CharField(max_length=250)
    fee= models.DecimalField(max_digits=9,decimal_places=2)
    status = models.CharField(default=None)
    product = models.TextField(default=None)
    transaction_created_at = models.DateTimeField(default=None)
    redeem_data = models.TextField(default=None, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True) 
    

class CardRedeemCode(models.Model):
    TransactionProduct = models.ForeignKey(TransactionProduct, on_delete=models.CASCADE, related_name='transactions_details_completed')
    redeem_card_number = models.CharField(max_length=250)
    redeem_card_pin = models.CharField(max_length=250)
    created_at = models.DateTimeField(auto_now_add=True)
    
    
class ErrorLog(models.Model):
    reference = models.CharField(default=None, max_length=250)
    email = models.EmailField(default=None)
    error_message = models.TextField()
    error_details = models.TextField()
    resolve = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    
class TopupTransaction(models.Model):
    user = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions', null=True, blank=True)
    user_type = models.CharField(max_length=200, default="guest")
    reference = models.CharField(max_length=14, unique=True, default=False, blank=False)
    operator = models.CharField(max_length=200, default=None)
    phone_number = models.IntegerField(default=None, blank=True, null=True)
    receiver_amount = models.DecimalField(default=None, decimal_places=2, max_digits=9)
    receiver_country = models.CharField(default=None, max_length=250)
    receiver_currency_code = models.CharField(default=None, max_length=250)
    total_paid = models.DecimalField(max_digits=9, decimal_places=2)
    sender_currency = models.CharField(max_length=250, default=None)
    sender_country = models.CharField(max_length=250, default=None)
    processing_fee = models.DecimalField(max_digits=9, decimal_places=2)
    payment_method = models.CharField(max_length=200, default=None)
    email = models.EmailField(default=None,blank=True, null=True)
    reloader_transaction = models.JSONField()
    paystack_very_transaction = models.JSONField()
    status = models.CharField(max_length=250, default=None)
    country = models.CharField(max_length=200, default=None)
    created_at = models.DateTimeField(auto_now_add=True)
    
class Cart(models.Model):
    user= models.ForeignKey(Account, on_delete=models.CASCADE, related_name='cart')
    productName = models.CharField(max_length=250, default=None)
    productId = models.IntegerField(default=None)
    quantity = models.IntegerField(default=None)
    recipientAmount = models.DecimalField(max_digits=9, decimal_places=2)
    recipientCurrency = models.CharField(default=None)
    AmountToPay = models.DecimalField(max_digits=9, decimal_places=2)
    currencyToPayIn = models.CharField(default=None, max_length=10)
    processing_fee = models.DecimalField(max_digits=9, decimal_places=2, default=2.0)
    img = models.CharField(max_length=250, default=None)
    created_at = models.DateTimeField(auto_now_add=True)
    
    