from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from social_django.utils import load_strategy
from social_django.utils import load_backend
from social_core.backends.google import GoogleOAuth2
from social_core.exceptions import MissingBackend
from rest_framework.permissions import AllowAny  
from django.conf import settings
from django.contrib.auth import login
from .serializers import UserSerializer
from .models import Account
from rest_framework import status
from django.db.models import Q

# from google.auth.transport import requests

class GoogleLogin(APIView):
    
    permission_classes = [AllowAny]  # Use AllowAny permission class for unrestricted access
    
    def post(self, request):
        token = request.data.get('token')
        strategy = load_strategy(request)
        
        try:
            backend = load_backend(strategy=strategy, name='google-oauth2', redirect_uri=None)
            user_details = backend.user_data(token)
            email = user_details.get("email")
            if(email):
                user = Account.objects.filter(email=email, auth_type ="google")
                if user:
                    login(request, user, backend='django.contrib.auth.backends.ModelBackend')
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                        # 'user': UserSerializer(user).data,
                    })
                    
            else:
                return Response({'error': 'Invalide credential. Please Sign Up first '}, status.HTTP_400_BAD_REQUEST)

        except MissingBackend:
            return Response({'error': 'Google OAuth2 backend not configured properly'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



class GoogleSignup(APIView):
    permission_classes = [AllowAny]  # Use AllowAny permission class for unrestricted access

    def post(self, request):
        token = request.data.get('token')
        strategy = load_strategy(request)
        backend = load_backend(strategy=strategy, name='google-oauth2', redirect_uri=None)
        
        try:

            details = backend.user_data(token)
            first_name = details.get('given_name')
            last_name = details.get('family_name')
            email= details.get("email")
            email_verified = details.get('email_verified')
            email = details.get('email')
            # check if user already existe
            
            user = Account.objects.filter(email=email, auth_type ="google")
            if user:
                login(request, user, backend='django.contrib.auth.backends.ModelBackend')
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    # 'user': UserSerializer(user).data,
                })
            
            # check if the same email already exist 
            
            users = Account.objects.filter(( Q(auth_type="email") | Q(auth_type="facebook")), email=email)
            if users:
                return Response({'error': 'This email address is already registered. Please log in using this email or use a different Google account.'}, status=status.HTTP_400_BAD_REQUEST)            
            if email:
                user = Account.objects.create_user( email=email,first_name =first_name, last_name=last_name, email_verified=email_verified, auth_type="google")
                user.set_unusable_password()
                user.save()
                login(request, user)
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data,
                })
            return Response({'error': 'Failed to sign up user'}, status=400)
        except MissingBackend:
            return Response({'error': 'Google OAuth2 backend not configured properly'}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=400)