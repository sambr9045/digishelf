from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import GoogleLogin, GoogleSignup, EmailSignUp
from . import views

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('login/', views.LoginWithEmailView.as_view(), name="login_with_email"),
    path('api/social/google/', GoogleLogin.as_view(), name='google_login'),
    # path('api/social/facebook/', FacebookLogin.as_view(), name='facebook_login'),
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('auth/google/signup/', GoogleSignup.as_view(), name='google-signup'),
    path('auth/email/signup/', EmailSignUp.as_view(), name='google-signup'),
    path('getoparator/',views.GetOperator.as_view(), name="get_oparator" ),
    path('exchange-rate/',views.FiatExchangeRate.as_view(), name="fia_exchange_rate"),
    path('giftcards/', views.GetGistCard.as_view(), name="giftcard"),
    path('process-payment/', views.ProcessPayment.as_view(), name="process_payment"),
    path('giftcardorder/', views.GetGiftCardOrder.as_view(), name="giftcardorder"),
    path('giftcard-search/', views.GetSearchResult.as_view(), name="giftcardseach"),
    path('cart/', views.CartView.as_view(), name="cart"),
    path("aitimetopup/", views.AirtimeTopUpPurcahse.as_view(), name="airtime_top_up"),
    path("airtime-topup-order/", views.AirtimeSuccessOrder.as_view(), name="airtime_topup_order"),
    path("contact/", views.ContactView.as_view(), name="contact-us")
    

]
