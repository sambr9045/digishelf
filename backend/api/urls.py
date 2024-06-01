from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import GoogleLogin, GoogleSignup, EmailSignUp
from . import views

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/social/google/', GoogleLogin.as_view(), name='google_login'),
    # path('api/social/facebook/', FacebookLogin.as_view(), name='facebook_login'),
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('auth/google/signup/', GoogleSignup.as_view(), name='google-signup'),
    path('auth/email/signup/', EmailSignUp.as_view(), name='google-signup'),
    path('getoparator/',views.GetOperator.as_view(), name="get_oparator" ),
    path('exchange-rate/',views.FiatExchangeRate.as_view(), name="fia_exchange_rate"),
    path('giftcards/', views.GetGistCard.as_view(), name="giftcard")

]
