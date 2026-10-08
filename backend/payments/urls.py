from django.urls import path

from .views import CompletionOrderView, CreateOrderView, FulfillOrderView, OrderStatusView

from .paystack import PaystackOptionsView, PaystackQuoteView, PaystackInitializeView, PaystackVerifyView, PaystackWebhookView

urlpatterns = [
    path("paystack/options/", PaystackOptionsView.as_view()),
    path("paystack/quote/", PaystackQuoteView.as_view()),
    path("paystack/initialize/", PaystackInitializeView.as_view()),
    path("paystack/verify/<str:reference>/", PaystackVerifyView.as_view()),
    path("paystack/webhook/", PaystackWebhookView.as_view()),
    path("orders/", CreateOrderView.as_view(), name="create-usdc-order"),
    path("orders/<str:order_id>/", OrderStatusView.as_view(), name="usdc-order-status"),
    path("orders/<str:order_id>/fulfill/", FulfillOrderView.as_view(), name="fulfill-payment-order"),
    path("completion/<str:token>/", CompletionOrderView.as_view(), name="payment-order-completion"),
]
