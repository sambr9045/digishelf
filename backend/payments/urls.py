from django.urls import path

from .views import CompletionOrderView, CreateOrderView, FulfillOrderView, OrderStatusView

urlpatterns = [
    path("orders/", CreateOrderView.as_view(), name="create-usdc-order"),
    path("orders/<str:order_id>/", OrderStatusView.as_view(), name="usdc-order-status"),
    path("orders/<str:order_id>/fulfill/", FulfillOrderView.as_view(), name="fulfill-payment-order"),
    path("completion/<str:token>/", CompletionOrderView.as_view(), name="payment-order-completion"),
]
