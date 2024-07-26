from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from social_django.utils import load_strategy
from social_django.utils import load_backend
from social_core.backends.google import GoogleOAuth2
from social_core.exceptions import MissingBackend
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import threading
from django.contrib.auth import authenticate
from concurrent.futures import ThreadPoolExecutor, as_completed
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
import json, time
from django.db import transaction
import asyncio
import aiohttp
from . import tasks
import requests
load_dotenv()



class LoginWithEmailView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, format=None):
        import time
        
        email = request.data.get("email")
        password = request.data.get("password")
        # Validate email and password
        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user
        user = authenticate(request, email=email, password=password)
        if user is not None:
            token = RefreshToken.for_user(user)
            return Response({
                'refresh': str(token),
                'access': str(token.access_token),
                'user': UserSerializer(user).data,
            }, status=200)

        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
class GoogleLogin(APIView):
    
    permission_classes = [AllowAny]  # Use AllowAny permission class for unrestricted access
    
    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error':'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        strategy = load_strategy(request)
        
        try:
            backend = load_backend(strategy=strategy, name='google-oauth2', redirect_uri=None)
            user_details = backend.user_data(token)
            email = user_details.get("email")
            if(email):
                user = Account.objects.get(email=email, auth_type ="google")
                if user:
                    login(request, user, backend='django.contrib.auth.backends.ModelBackend')
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                        'user': UserSerializer(user).data,
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
        if not token:
            return Response({'error':'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify the token with Google's API
        # response = requests.get(f'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={token}')
        # if response.status_code != 200:
        #     return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


        strategy = load_strategy(request)
        backend = load_backend(strategy=strategy, name='google-oauth2', redirect_uri=None)
        
        try:

            details = backend.user_data(token)
            first_name = details.get('given_name')
            last_name = details.get('family_name')
            email= details.get("email")
            email_verified = details.get('email_verified')
            email = details.get('email')
            
            if not email_verified:
                return Response({'error': 'Email not verified by Google'}, status=status.HTTP_400_BAD_REQUEST)
        
            # check if user already existe 
            user = Account.objects.filter(email=email, auth_type ="google").first()
            if user:
                login(request, user, backend='django.contrib.auth.backends.ModelBackend')
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data,
                })
            
            # check if the same email already exist 
            if Account.objects.filter(email=email).exclude(auth_type="google").exists():
                print("it is here")
                return Response(
                    {'error': 'This email address is already registered. Please log in using this email or use a different Google account.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # users = Account.objects.filter(( Q(auth_type="email") | Q(auth_type="facebook")), email=email)
            # if users:
            #     return Response({'error': 'This email address is already registered. Please log in using this email or use a different Google account.'}, status=status.HTTP_400_BAD_REQUEST)            
            if email:
                user = Account.objects.create_user( email=email,first_name =first_name, last_name=last_name, email_verified=email_verified, auth_type="google")
                user.set_unusable_password()
                user.save()
                login(request, user, backend='django.contrib.auth.backends.ModelBackend')
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data,
                })
            return Response({'error': 'Failed to sign up user'}, status=400)
        except MissingBackend:
            return Response({'error': 'Google OAuth2 backend not configured properly'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print(e)
            return Response({'error': 'An error occurred'}, status=status.HTTP_400_BAD_REQUEST)
        

class EmailSignUp(APIView):
    permission_classes = [AllowAny]  

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
            oparator_urls = urls.auto_detect_oparator(phone, country.upper())
            audience = "https://topups-sandbox.reloadly.com"
            
            try:
                result= reloady_object.make_api_request(oparator_urls,"application/com.reloadly.topups-v1+json", audience )
                
                if result:
                    return Response({"data":result, "autoDetected":True}, status=200)
            except Exception as e:
               print(e)
                
            
            # if result failed get the oparators by country name
            
            operators_by_countri = reloady_object.make_api_request(urls.get_operators_by_country(country.upper()),"application/com.reloadly.topups-v1+json", audience )
            
            return Response({"data":operators_by_countri, "autoDetected":False}, status=200)
            
        except Exception as e:
            print(f"Error:{e}")
            return Response({"status":"Error !! Something went wrong please try again later.", "data":None, "autoDetected":False}, status=400)
            
    
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
                
                print(giftcard_url)
                    
                reloady_object = reloady.Reloady(os.getenv("api_clien"),os.getenv("api_client_secret"), urls.token_url)
                audience = "https://giftcards-sandbox.reloadly.com"

                result = reloady_object.make_api_request(giftcard_url, "application/com.reloadly.giftcards-v1+json", audience)
                # print(result)
                return Response({"data":result},status=200 )
            
            except Exception as e:
                print(e)
                return Response({"message":e }, status=400)

class ProcessPayment(APIView):
    permission_classes = [AllowAny]
    
    
    def post(self, request, *args, **kwargs):
        start_time = time.time()
        print("Starting executing code: ", start_time)
        transaction_data = request.data.get('transaction')
        payment_details_data = request.data.get('payment_details')
        user_device_data = request.data.get('user_device')
        order_product = transaction_data.get("products")
        

        try:
            with transaction.atomic():  # Start an atomic transaction
                # Create GiftCardTransaction
                # threads = []
                
                # Check if my balance i hihgter then process with payment 
                
                transaction_serializer = serializers.GiftCardTransactionSerializer(data=transaction_data)
                transaction_serializer.is_valid(raise_exception=True)
                transaction_ = transaction_serializer.save()
                
                
                # Ensure the transaction is committed before proceeding
                transaction_.refresh_from_db()
                
                # create products
                order_product_serializers = []
                for product_data in order_product:
                    product_data["GiftCardTransaction"] = transaction_.id
                    del product_data["id"]
                    product_data["img"] = str(product_data["img"])
                    product_data['transaction'] = transaction_.id
                    product_serializer = serializers.GiftCardTransactionOrderProductSerialixer(data=product_data)
                    product_serializer.is_valid(raise_exception=True)
                    product_serializer.save()
                    order_product_serializers.append(product_serializer)
                
                # Create PaymentDetails
                payment_details_data['GiftCardTransaction'] = transaction_.id
                payment_details_serializer = serializers.PaymentDetailsSerializer(data=payment_details_data)
                payment_details_serializer.is_valid(raise_exception=True)
                payment_details = payment_details_serializer.save()

                # Create UserDeviceGiftCardPayment
                user_device_data['GiftCardTransaction'] = transaction_.id
                user_device_serializer = serializers.UserDeviceGiftCardPaymentSerializer(data=user_device_data)
                user_device_serializer.is_valid(raise_exception=True)
                user_device = user_device_serializer.save()
                
                # Make API request to external service using ThreadPoolExecutor
                # multiple_api_request = []
                for index, prduct_data_request in enumerate(order_product):
                    tasks.make_api_requests.delay(prduct_data_request, index,transaction_data, transaction_.id)
                   
                
                end_time = time.time()
                elapsed_time = end_time - start_time
                print(f"End time: {end_time} \n")
                print("How many seconds it took: ", elapsed_time, " s \n")
                return Response({
                        "reference": transaction_data.get("reference"),
                        "status": "success"
                    }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            # Log the error for debugging
            log_error(transaction_data, e)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

def log_error(transaction_data, error):
    # Log the error details for further analysis
    try:
        models.ErrorLog.objects.create(
            reference=transaction_data.get("reference"),
            email=transaction_data.get("email"),
            error_message=str(error),
            error_details=json.dumps(transaction_data)
        )
    except Exception as log_error:
        print(f"Failed to log error: {log_error}")

 

class GetGiftCardOrder(APIView):
    permission_classes = [AllowAny]  # Example: Change permission if needed

    def post(self, request):
        order_reference = request.data.get("reference")
        print(order_reference)
        if not order_reference:
            return Response({"error": "Reference is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product_data = models.GiftCardTransaction.objects.filter(reference=order_reference).first()
        except models.GiftCardTransaction.DoesNotExist:
            
            return Response({"error": "Gift card transaction not found"}, status=400)

        try:
            transaction_product = models.TransactionProduct.objects.filter(GiftCardTransaction=product_data)
        except (models.TransactionProduct.DoesNotExist) as e:
            return Response({"error": str(e)}, status=400)
        
        
        print(product_data, transaction_product)

        # Using serializers to return model data
        product_serializer = serializers.GiftCardTransactionSerializer(product_data)
        # print(product_serializer)
        transaction_serializer = serializers.TransactionProductSerializer(transaction_product, many=True)
        # redeem_code_serializer = serializers.CardRedeemCodeSerializer(redeem_code)

        response_object = {
            "product_data":product_serializer.data,
            "transactionData":transaction_serializer.data,
            # "redeem_code": redeem_code_serializer.data
        }

        return Response({"data": response_object}, status=status.HTTP_200_OK)
    

class GetSearchResult(APIView):
    permission_classes = [AllowAny]
    
    def get(sefl, request):
        country = request.GET.get("country", "")
        gift_card_name = request.GET.get("name", "")
        
        page = request.GET.get("page", "")
        print(country, gift_card_name, page)
       

        reloady_object = reloady.Reloady(os.getenv("api_clien"), os.getenv("api_client_secret"), urls.token_url)
        
        audience = "https://giftcards-sandbox.reloadly.com"
        
        result = reloady_object.make_api_request(urls.get_giftcard_url_two(gift_card_name, country, page), "application/com.reloadly.giftcards-v1+json", audience)
        
        if result:
            return Response({"data":result["content"]}, status=200)
        
        return Response({"data":None}, status=400)
        

            
        # {

class CartView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, format=None):
        data = request.data
        data["img"] = str(data.get("img")[0])  # Example modification to data
        if 'user' not in data:
            data['user'] = request.user.pk  # Assign current user
        
        serializer = serializers.CartSerializer(data=data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"data":"success"}, status=status.HTTP_201_CREATED)
        
        
        return Response({"data":"This item already exist"}, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request, format=None):
        user = request.user
        cart = models.Cart.objects.filter(user=user).order_by("-id")
        serializer = serializers.CartSerializer(cart , many=True)
        return Response(serializer.data, status=200)

    def put(self, request, format=None):
        cartid = request.GET.get("id")
        cart_quantity = request.data.get("quantity")
        object_ = models.Cart.objects.filter(
            pk=cartid
        ).update(quantity=cart_quantity)
        return Response({"data":"success"}, status=200)
        
        
    def delete(self, request, format=None):
        cartid = request.GET.get("id")
        object_ = models.Cart.objects.filter(pk=cartid).delete()
        return Response({"data":"success"}, status=200)
        


class AirtimeTopUpPurcahse(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request, format=None):
        transaction_data = request.data.get("transaction")
        receiver_amount = request.data.get("receiverAmount")
        receiver_currency = request.data.get("receiverCurrency")
        amountPaid = request.data.get('AmountPaid')
        email = request.data.get("email")
        user_type = request.data.get("userType")
        proccessing_fee = request.data.get("ProcessingFee")
        payment_currency = request.data.get("PaymentCurreuncy")
        payment_method = request.data.get("PaymentMethod")
        converted_amount = request.data.get("ConvertedAmountToUsd")
        operator_data = request.data.get("oparatorData")
        edited_number = request.data.get("editNumber")
        ghana_cedis_exchange_rate = request.data.get("ghana_cedis_rate")
        country = request.data.get("country")
        try:
            with transaction.atomic():
                # verify from paystack if payment is successfull
                if payment_method == "cbc":
                    
                    response = requests.get(f"https://api.paystack.co/transaction/verify/{transaction_data.get('reference')}", headers={
                            "Authorization": f"Bearer {os.getenv('PAYSTACK_SECRET_KEY')}",
                            "Cache-Control": "no-cache"
                        })
                    
                    # print(response)
                    
                    if response.status_code != 200:
                        return Response(
                            {"error": "An error occurred", "details": "Specific details about the error"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    paystack_data = response.json()
                    # print(data)
                    
                    if not paystack_data.get("status", False):
                        return Response({"error":"Failed to verify payment. Please contact support"}, status=status.HTTP_400_BAD_REQUEST)
                        
                    # fetch reloady balance to see if purchasing amount is less than reloady balance 
                    
                    reloady_object = reloady.Reloady(os.getenv("api_clien"), os.getenv("api_client_secret"), urls.token_url)
                    balance = reloady_object.get_balance()
                    print(balance, "This is the balance")
                    reloady_balance_currency_code = balance.get("currencyCode")
                    if payment_currency == "GHS" and reloady_balance_currency_code == "GHS":
                        if float(balance.get("balance")) < float(receiver_amount):
                            return Response({"error":"Something went wrong please try again later !!!"}, status=status.HTTP_400_BAD_REQUEST)
                    
                    if payment_currency == "USD" and reloady_balance_currency_code == "GHS":
                        if converted_amount != False:
                            
                            if float(balance.balance) < float(receiver_amount) * float(ghana_cedis_exchange_rate):
                                return Response({"error":"Something went wrong please try again later !!!"}, status=status.HTTP_400)
                            
                    # topup reloadet topapi 
                    data ={
                        "operatorId": operator_data.get("data").get("operatorId"),
                        "amount": receiver_amount,
                        "useLocalAmount": True,
                        "customIdentifier": transaction_data.get("reference"),
                        "recipientEmail": email,
                        "recipientPhone": {
                            "countryCode": operator_data.get("data").get("country").get("isoName"),
                            "number": edited_number
                        },
                        
                    }
                    audience ="https://topups-sandbox.reloadly.com"
                    response = reloady_object.make_api_request(urls.airtime_top_up, "application/com.reloadly.topups-v1+json",audience, "POST", data)
                    
                    if response:
                        # save transaction to database 
                        # serializer data 
                        user = None
                        if user_type == "guest":
                            user=""
                        else:
                            user = user_type.get("id")
                            user_type = "user"
                                
                        data ={
                            "user":user,
                            "user_type" :user_type,
                            "reference":transaction_data.get("reference"),
                            "operator":operator_data.get("data").get("name"),
                            "phone_number":edited_number,
                            "receiver_amount":receiver_amount,
                            "receiver_country": operator_data.get("data").get("country").get("name"),
                            "receiver_currency_code":receiver_currency,
                            "total_paid":paystack_data.get("data").get("amount") /100,
                            "sender_currency":payment_currency,
                            "sender_country":country,
                            "processing_fee":proccessing_fee,
                            "payment_method": payment_method,
                            "email":email,
                            "reloader_transaction":response,
                            "paystack_very_transaction":paystack_data,
                            "status":response.get("status"),
                            "country":country,
                            
                        }
            
                        airtime_top_up_serializer = serializers.AirtimTopUpSerializer(data=data)
                        airtime_top_up_serializer.is_valid(raise_exception=True)
                        airtime_top_up_serializer.save();
                    
                        return Response({"data":response}, status=200)
        
        except Exception as e:
            print(e)
            return Response({"error":e}, status=status.HTTP_400_BAD_REQUEST)
        

class AirtimeSuccessOrder(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        reference = request.data.get("reference")  # Using query_params for GET request

        if not reference:
            return Response({"error": "Reference parameter is missing."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            airtime_order = models.TopupTransaction.objects.get(reference=reference)
            print(airtime_order, reference, "This is the")
            serializer_ = serializers.AirtimTopUpSerializer(airtime_order)
            
        except models.TopupTransaction.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response(serializer_.data, status=status.HTTP_200_OK)
            


class ContactView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        import time
        time.sleep(1000)
        data = request.data
        formData = data.get("formData")
        token = data.get("token")
        # verify this google token
        print(token)
        print(formData)
        try:
            contact_serializer = serializers.ContactSerializer(data=formData)
            contact_serializer.is_valid(raise_exception=True)
            contact_serializer.save()
            return Response({"data":"success"}, status=200)
        except Exception as e:
            return Response({"error":e}, status=status.HTTP_400_BAD_REQUEST)
    
        
        
