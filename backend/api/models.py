from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission
from django.db import models
from django.utils.translation import gettext_lazy as _

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
        
# class Transaction(models.Model):
#     user = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions', null=True, blank=True)
#     reference = models.CharField(max_length=200, default=None, blank=False, null=False)
#     type = models.CharField(max_length=200, default=None, )
#     amount_in_usd = models.DecimalField(max_digits=9, decimal_places=2)
#     amount_local_currency = models.DecimalField(max_digits=9,decimal_places=2)
#     processing_fee = models.DecimalField(max_digits=9, decimal_places=2)
#     payment_method = models.CharField(max_length=200, default=None)
#     phone_number = models.IntegerField(default=None, blank=True, null=True)
#     operator = models.IntegerField(default=None, blank=True, null=True)
#     email = models.EmailField(default=None,blank=True, null=True)
    
    
class TopupTransaction(models.Model):
    user = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions', null=True, blank=True)
    user_type = models.CharField(max_length=200, default="guest")
    operator = models.CharField(max_length=200, default=None)
    amount_in_usd = models.DecimalField(max_digits=9, decimal_places=2)
    amount_local_currency = models.DecimalField(max_digits=9,decimal_places=2)
    processing_fee = models.DecimalField(max_digits=9, decimal_places=2)
    payment_method = models.CharField(max_length=200, default=None)
    phone_number = models.IntegerField(default=None, blank=True, null=True)
    email = models.EmailField(default=None,blank=True, null=True)
    country = models.CharField(max_length=200, default=None)
    created_at = models.DateTimeField(auto_now_add=True)
    
    