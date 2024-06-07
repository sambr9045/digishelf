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
from .serializers import UserSerializer, UserRegistrationSerializer
from .models import Account, DigiShelfData
from rest_framework import status
from django.db.models import Q
from reloady import reloady, urls
import os 
from dotenv import load_dotenv
import requests
# from google.auth.transport import requests
from . import serializers
from . import models
import json

load_dotenv()
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
        

class EmailSignUp(APIView):
    permission_classes = [AllowAny]  # Use AllowAny permission class for unrestricted access

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        else:
            # Check for specific validation errors
            if 'email' in serializer.errors and any(
                error.code == 'unique' for error in serializer.errors['email']
            ):
                return Response(
                    {"error": "User with this email already exists."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  
  
  
class GetOperator(APIView):
    permission_classes = [AllowAny]  # Use AllowAny permission class for unrestricted access

    def post(self, request):
        phone = request.data.get("phone")
        country = request.data.get("country")
        
        try:
            reloady_object = reloady.Reloady(os.getenv("api_clien"),os.getenv("api_client_secret"), urls.token_url)
            oparator_urls = urls.auto_detect_oparator(phone, country)
            audience = "https://topups-sandbox.reloadly.com"
            result= reloady_object.make_api_request(oparator_urls,"application/com.reloadly.topups-v1+json", audience )
            return Response({"data":result}, status=200)
        except Exception as e:
            print(f"Error:{e}")
            return Response({"status":"error", "data":None}, status=400)
            
    
class FiatExchangeRate(APIView):
    permission_classes = [AllowAny]  
    def get(self, request):
        try:
            url = urls.get_exchange_fiat_url(os.getenv("FIA_CURRENCY_EXCHANGE_API_KEY"))
            data = requests.get(url)
            # get rate percentages
            profile_entry = DigiShelfData.objects.first()
            percentage = profile_entry.profit_percentage
            processing = profile_entry.processing_fee
            giftcard_processing_fee = profile_entry.giftcard_processing_fee
            
            
            return Response({"data":data, "percentage":percentage, "processing":processing, "giftcard_processing_fee":giftcard_processing_fee}, status=200) 
        except:
            return Response({"Error":"something went wrong. Try again later"}, status=400)
        
        
class DebiTCreditPayment(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        number  = request.data.get("number")
        email = request.data.get("email")
        option_data = request.data.get("option_data")
        payment_method = request.data.get("payment_method")
        country = request.data.get("crountry")
        provider = request.data.get("provider")
        # paystack payment 
        # then call a function to send topup airtime 
        
        
        pass
    
class GetGistCard(APIView):
    permission_classes= [AllowAny]
    def get(self, request):
        # get reloady data 
        type = request.GET.get("type", None)
        productId = request.GET.get("productId", None)
        
        if type or productId:
            try:
                if productId:
                    giftcard_url = urls.gift_card_product_id(productId)
                if type:
                    giftcard_url = urls.get_giftcard_url(type)
                    
                reloady_object = reloady.Reloady(os.getenv("api_clien"),os.getenv("api_client_secret"), urls.token_url)
                audience = "https://giftcards-sandbox.reloadly.com"

                result = reloady_object.make_api_request(giftcard_url, "application/com.reloadly.giftcards-v1+json", audience)
                # print(result)
                return Response({"data":result},status=200 )
            
            except Exception as e:
                print(e)
                return Response({"message":e }, status=400)
        
class ProcessPayment(APIView):
    permission_classes= [AllowAny]
    def post(self, request, *args, **kwargs):
            transaction_data = request.data.get('transaction')
            payment_details_data = request.data.get('payment_details')
            user_device_data = request.data.get('user_device')

            # Create GiftCardTransaction
            transaction_serializer = serializers.GiftCardTransactionSerializer(data=transaction_data)
            if transaction_serializer.is_valid():
                transaction = transaction_serializer.save()
                
                # Create PaymentDetails
                payment_details_data['GiftCardTransaction'] = transaction.id
                payment_details_serializer = serializers.PaymentDetailsSerializer(data=payment_details_data)
                if payment_details_serializer.is_valid():
                    payment_details_serializer.save()
                    
                    # Create UserDeviceGiftCardPayment
                    user_device_data['GiftCardTransaction'] = transaction.id
                    user_device_serializer =serializers.UserDeviceGiftCardPaymentSerializer(data=user_device_data)
                    if user_device_serializer.is_valid():
                        user_device_serializer.save()
                        
                        
                        # make api request here if possibly two request to make and order then get the order reponse id 
                        reloady_object = reloady.Reloady(os.getenv("api_clien"),os.getenv("api_client_secret"), urls.token_url)
                        audience = "https://giftcards-sandbox.reloadly.com"
                        
                        data ={
                            "productId":transaction_data.get("product_id"),
                            "quantity":1,
                            "unitPrice":transaction_data.get("recipient_amount"),
                            "customIdentifier":transaction_data.get("reference"),
                            "senderName":"DigiShelf",
                            "preOrder": False
                        }
                        result = reloady_object.make_api_request(urls.gift_card_order, "application/com.reloadly.giftcards-v1+json", audience, "POST", data)
                        print(result)
                        if result :
                            TransactionProduct = models.TransactionProduct.objects.create(
                                GiftCardTransaction=transaction,
                                transactionId=result.get("transactionId"),
                                amount=result.get("amount"),
                                discount=result.get("discount"),
                                currencyCode=result.get('currencyCode'),
                                fee=result.get('fee'),
                                status=result.get("status"),
                                product =json.dumps(result.get("product")),
                                transaction_created_at=result.get("transactionCreatedTime")
                                )
                            
                            if result.get("status") == "SUCCESSFUL":
                                # get redeem code
                                reloady_object = reloady.Reloady(os.getenv("api_clien"),os.getenv("api_client_secret"), urls.token_url)
                                audience = "https://giftcards-sandbox.reloadly.com"
                                
                                response = reloady_object.make_api_request(urls.get_giftcard_redeem_code(result.get("transactionId")), "application/com.reloadly.giftcards-v1+json", audience)
                                
                                if response:
                                    
                                    models.CardRedeemCode.objects.create(
                                        TransactionProduct=TransactionProduct,
                                        redeem_card_number=response[0].get("cardNumber"),
                                        redeem_card_pin= response[0].get("pinCode")   
                                    )
                                
                        
                            return Response({
                                "reference":transaction_data.get("reference"),
                                "status":"success"
                                # 'ree': transaction_serializer.data,
                                # 'payment_details': payment_details_serializer.data,
                                # 'user_device': user_device_serializer.data,
                                # 'status':result.get("status"),
                                # 'redeem_data':response,
                            }, status=status.HTTP_201_CREATED)
                        else:
                            transaction.delete()  # Rollback transaction if user device creation fails
                            return Response(user_device_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                            
                    else:
                        transaction.delete()  # Rollback transaction if user device creation fails
                        return Response(user_device_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                else:
                    transaction.delete()  # Rollback transaction if payment details creation fails
                    return Response(payment_details_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response(transaction_serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class GetGiftCardOrder(APIView):
    permission_classes= [AllowAny]
    
    def get(self, request):
        reference = request.GET.get("reference")
        product_data = models.GiftCardTransaction.objects.filter(reference=reference).first()
        TransactionP = models.TransactionProduct.objects.get(GiftCardTransaction=product_data)
        redeem_code = models.CardRedeemCode.objects.get(TransactionProduct=redeem_code)
        
        response_object ={
            "product_data":product_data,
            "transactionData":TransactionP,
            "redeem_code":redeem_code
        }
        
        return Response({"data":response_object}, status=200)
        

class GetGiftCardOrder(APIView):
    permission_classes = [AllowAny]  # Example: Change permission if needed

    def get(self, request):
        reference = request.GET.get("reference")
        if not reference:
            return Response({"error": "Reference is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product_data = models.GiftCardTransaction.objects.get(reference=reference)
        except models.GiftCardTransaction.DoesNotExist:
            return Response({"error": "Gift card transaction not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            transaction_product = models.TransactionProduct.objects.get(GiftCardTransaction=product_data)
            redeem_code = models.CardRedeemCode.objects.get(TransactionProduct=transaction_product)
        except (models.TransactionProduct.DoesNotExist, models.CardRedeemCode.DoesNotExist) as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

        # Using serializers to return model data
        product_serializer = serializers.GiftCardTransactionSerializer(product_data)
        transaction_serializer = serializers.TransactionProductSerializer(transaction_product)
        redeem_code_serializer = serializers.CardRedeemCodeSerializer(redeem_code)

        response_object = {
            "product_data": product_serializer.data,
            "transactionData": transaction_serializer.data,
            "redeem_code": redeem_code_serializer.data
        }

        return Response({"data": response_object}, status=status.HTTP_200_OK)
    

# {
#     "transactionId": 1,
#     "amount": 34536.21,
#     "discount": 1709.72,
#     "currencyCode": "NGN",
#     "fee": 285,
#     "recipientEmail": "anyone@email.com",
#     "customIdentifier": "obucks1dime0",
#     "status": "SUCCESSFUL",
#     "product": {
#         "productId": 1,
#         "productName": "1-800-PetSupplies",
#         "countryCode": "PS",
#         "quantity": 1,
#         "unitPrice": 59.99,
#         "totalPrice": 59.99,
#         "currencyCode": "USD",
#         "brand": {
#             "brandId": 6,
#             "brandName": "1-800-PetSupplies"
#         }
#     },
#     "smsFee": 56.91,
#     "recipientPhone": 34012345678,
#     "transactionCreatedTime": "2022-02-28 13:46:00",
#     "preOrdered": false
# }