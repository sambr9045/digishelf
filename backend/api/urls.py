from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import GoogleLogin, FacebookLogin

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/social/google/', GoogleLogin.as_view(), name='google_login'),
    path('api/social/facebook/', FacebookLogin.as_view(), name='facebook_login'),
]