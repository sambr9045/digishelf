from django.contrib import admin
from . import models
# Register your models here.

admin.site.register(models.Account)
admin.site.register(models.DigiShelfData)
admin.site.register(models.UserDeviceGiftCardPayment)
admin.site.register(models.PaymentDetails)
admin.site.register(models.GiftCardTransaction)
admin.site.register(models.TransactionProduct)
# admin.site.register(models.CardRedeemCode)
admin.site.register(models.ErrorLog)
admin.site.register(models.Cart)