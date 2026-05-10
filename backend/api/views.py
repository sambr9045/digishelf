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
from django.core.cache import cache
from django.contrib.auth import login
from django.http import HttpResponse
from .serializers import UserSerializer, UserRegistrationSerializer
from .models import Account, DigiShelfData
from rest_framework import status
from django.db.models import Q
from reloady import reloady, urls
import os 
from dotenv import load_dotenv
import requests
from decimal import Decimal, InvalidOperation
# from google.auth.transport import requests
from . import serializers
from . import models
import hashlib
import json, time
from django.db import transaction
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
import asyncio
import aiohttp
from . import tasks
import requests
from itertools import chain
from operator import attrgetter
from urllib.parse import quote
from difflib import SequenceMatcher
from xml.sax.saxutils import escape
from payments.fulfillment import (
    build_giftcard_email_entries,
    send_giftcard_codes_email,
    serialize_giftcard_product,
)
load_dotenv()

RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"
CONTACT_RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("CONTACT_RATE_LIMIT_WINDOW_SECONDS", "900"))
CONTACT_RATE_LIMIT_MAX_PER_IP = int(os.getenv("CONTACT_RATE_LIMIT_MAX_PER_IP", "5"))
CONTACT_RATE_LIMIT_MAX_PER_EMAIL = int(os.getenv("CONTACT_RATE_LIMIT_MAX_PER_EMAIL", "3"))
ANALYTICS_MAX_EVENTS_PER_REQUEST = int(os.getenv("ANALYTICS_MAX_EVENTS_PER_REQUEST", "25"))
SITEMAP_GIFTCARD_MAX_PAGES = int(os.getenv("SITEMAP_GIFTCARD_MAX_PAGES", "50"))
GIFT_CARD_SEARCH_PAGE_SIZE = int(os.getenv("GIFT_CARD_SEARCH_PAGE_SIZE", "60"))
GIFT_CARD_FUZZY_MIN_SCORE = float(os.getenv("GIFT_CARD_FUZZY_MIN_SCORE", "0.54"))
GIFT_CARD_CACHE_TIMEOUT_SECONDS = int(
    os.getenv("GIFT_CARD_CACHE_TIMEOUT_SECONDS", str(34 * 60 * 60))
)
DEFAULT_PUBLIC_SITE_URL = os.getenv("PUBLIC_SITE_URL") or os.getenv("SITE_URL")


def get_recaptcha_secret():
    secret = os.getenv("RECAPTCHA_SECRET_KEY") or os.getenv("GOOGLE_RECAPTCHA_SECRET_KEY")
    if not secret:
        raise ValueError("Missing RECAPTCHA_SECRET_KEY or GOOGLE_RECAPTCHA_SECRET_KEY")
    return secret


def verify_recaptcha_token(token, remote_ip=None):
    if not token:
        return False

    payload = {
        "secret": get_recaptcha_secret(),
        "response": token,
    }
    if remote_ip:
        payload["remoteip"] = remote_ip

    response = requests.post(RECAPTCHA_VERIFY_URL, data=payload, timeout=10)
    response.raise_for_status()
    return bool(response.json().get("success"))


def get_admin_notification_email():
    return (
        os.getenv("ADMIN_NOTIFICATION_EMAIL")
        or os.getenv("ADMIN_NOTIFICTION_EMAIL")
        or settings.DEFAULT_FROM_ADDRESS
    )


def send_contact_notification(contact):
    admin_email = get_admin_notification_email()
    if not admin_email:
        return

    subject = f"New Digishelves contact message from {contact.name}"
    body = (
        f"New contact message received.\n\n"
        f"Name: {contact.name}\n"
        f"Email: {contact.email}\n\n"
        f"Message:\n{contact.message}\n"
    )
    message = EmailMultiAlternatives(
        subject=subject,
        body=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[admin_email],
        reply_to=[contact.email] if contact.email else None,
    )
    message.send(fail_silently=False)


def _contact_rate_limit_key(scope, value):
    normalized = (value or "").strip().lower()
    digest = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
    return f"contact.rate_limit.{scope}.{digest}"


def _get_client_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def _get_optional_request_user(request):
    try:
        auth_result = JWTAuthentication().authenticate(request)
    except Exception:
        return None

    if not auth_result:
        return None

    user, _ = auth_result
    return user


def _normalize_analytics_decimal(value):
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return Decimal("0.00")


def _register_contact_attempt(scope, value, max_attempts):
    if not value:
        return None

    cache_key = _contact_rate_limit_key(scope, value)
    current = int(cache.get(cache_key, 0)) + 1
    cache.set(cache_key, current, timeout=CONTACT_RATE_LIMIT_WINDOW_SECONDS)

    if current > max_attempts:
        return {
            "scope": scope,
            "retry_after": CONTACT_RATE_LIMIT_WINDOW_SECONDS,
        }

    return None


def check_contact_rate_limit(email, remote_ip):
    ip_limit = _register_contact_attempt("ip", remote_ip, CONTACT_RATE_LIMIT_MAX_PER_IP)
    if ip_limit:
        return ip_limit

    email_limit = _register_contact_attempt("email", email, CONTACT_RATE_LIMIT_MAX_PER_EMAIL)
    if email_limit:
        return email_limit

    return None


def _slugify(value):
    return (
        str(value or "")
        .lower()
        .strip()
        .replace("&", " and ")
    ).translate(str.maketrans({char: "-" for char in r""" !@#$%^*()+=[]{}\|;:'",.<>/?`~_"""})).strip("-")


def _normalize_public_site_url(request):
    base_url = DEFAULT_PUBLIC_SITE_URL or request.build_absolute_uri("/")
    return base_url.rstrip("/")


def _build_public_url(request, path):
    base_url = _normalize_public_site_url(request)
    normalized_path = path if path.startswith("/") else f"/{path}"
    return f"{base_url}{normalized_path}"


def _normalize_search_value(value):
    return " ".join(str(value or "").lower().strip().replace("-", " ").split())


def _giftcard_country_matches(item, country_code):
    normalized_country = str(country_code or "").strip().upper()
    if not normalized_country:
        return True

    country = item.get("country") or {}
    possible_values = {
        str(country.get("isoName") or "").strip().upper(),
        str(country.get("code") or "").strip().upper(),
        str(item.get("countryCode") or "").strip().upper(),
        str(country.get("name") or "").strip().upper(),
    }
    return normalized_country in possible_values


def _giftcard_search_score(item, query):
    normalized_query = _normalize_search_value(query)
    if not normalized_query:
        return 0

    product_name = str(item.get("productName") or "")
    brand_name = str((item.get("brand") or {}).get("brandName") or "")
    country_name = str((item.get("country") or {}).get("name") or "")
    search_fields = [
        _normalize_search_value(product_name),
        _normalize_search_value(brand_name),
        _normalize_search_value(f"{brand_name} {product_name}"),
        _normalize_search_value(f"{brand_name} {product_name} {country_name}"),
    ]
    query_tokens = [token for token in normalized_query.split(" ") if token]
    best_score = 0.0

    for field in search_fields:
        if not field:
            continue

        if normalized_query == field:
            best_score = max(best_score, 1.0)
            continue

        if normalized_query in field:
            best_score = max(best_score, 0.97)

        field_tokens = field.split(" ")
        token_matches = 0
        for token in query_tokens:
            if any(
                token == field_token
                or field_token.startswith(token)
                or token.startswith(field_token)
                or SequenceMatcher(None, token, field_token).ratio() >= 0.78
                for field_token in field_tokens
            ):
                token_matches += 1

        if query_tokens:
            best_score = max(best_score, token_matches / len(query_tokens))

        best_score = max(best_score, SequenceMatcher(None, normalized_query, field).ratio())

    return best_score


def _run_fuzzy_giftcard_search(gift_card_name, country, page):
    all_entries = _build_giftcard_sitemap_entries()
    scored_matches = []

    for item in all_entries:
        if not _giftcard_country_matches(item, country):
            continue

        score = _giftcard_search_score(item, gift_card_name)
        if score >= GIFT_CARD_FUZZY_MIN_SCORE:
            scored_matches.append((score, item))

    scored_matches.sort(
        key=lambda entry: (
            -entry[0],
            str(entry[1].get("productName") or "").lower(),
            str((entry[1].get("country") or {}).get("name") or "").lower(),
        )
    )

    deduped = []
    seen_product_ids = set()
    for _, item in scored_matches:
        product_id = item.get("productId")
        if not product_id or product_id in seen_product_ids:
            continue
        seen_product_ids.add(product_id)
        deduped.append(item)

    try:
        page_number = max(int(str(page or "1")), 1)
    except (TypeError, ValueError):
        page_number = 1
    start = (page_number - 1) * GIFT_CARD_SEARCH_PAGE_SIZE
    end = start + GIFT_CARD_SEARCH_PAGE_SIZE
    return deduped[start:end]


def _build_giftcard_path(item, fallback_type="gift-card"):
    product_id = item.get("productId")
    product_name = item.get("productName") or fallback_type
    brand_name = ((item.get("brand") or {}).get("brandName")) or fallback_type or product_name
    country = item.get("country") or {}
    country_name = (
        country.get("isoName")
        or country.get("name")
        or item.get("countryCode")
        or item.get("recipientCurrencyCode")
        or "global"
    )

    if not product_id:
        return f"/gift-card/{quote(_slugify(product_name))}"

    return (
        f"/gift-card/{_slugify(brand_name)}/{_slugify(country_name)}/"
        f"{_slugify(product_name)}/{product_id}"
    )


def _build_giftcard_sitemap_entries():
    cache_key = f"seo_sitemap_giftcards:{SITEMAP_GIFTCARD_MAX_PAGES}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    entries = []
    page_size = 120

    try:
        reloady_object = reloady.Reloady(
            os.getenv("api_clien"),
            os.getenv("api_client_secret"),
            urls.token_url,
        )
        audience = "https://giftcards-sandbox.reloadly.com"
        total_pages = None
        page = 1

        while page <= max(SITEMAP_GIFTCARD_MAX_PAGES, 1):
            if total_pages is not None and page > total_pages:
                break

            giftcard_catalog_url = (
                "https://giftcards-sandbox.reloadly.com/products"
                f"?size={page_size}&page={page}&productName=&countryCode="
                "&includeRange=true&includeFixed=true&sorted=false"
            )
            result = reloady_object.make_api_request(
                giftcard_catalog_url,
                "application/com.reloadly.giftcards-v1+json",
                audience,
            )
            content = result.get("content") if isinstance(result, dict) else None
            if not content:
                break

            api_total_pages = result.get("totalPages") if isinstance(result, dict) else None
            if isinstance(api_total_pages, int) and api_total_pages > 0:
                total_pages = api_total_pages

            for item in content:
                if not item.get("productId") or not item.get("productName"):
                    continue

                has_price_info = bool(
                    item.get("minRecipientDenomination")
                    or item.get("maxRecipientDenomination")
                    or item.get("fixedRecipientToSenderDenominationsMap")
                )
                if not has_price_info:
                    continue

                entries.append(item)

            if total_pages is None and len(content) < page_size:
                break

            page += 1

        deduped = []
        seen = set()
        for item in entries:
            product_id = item.get("productId")
            if product_id in seen:
                continue
            seen.add(product_id)
            deduped.append(item)

        cache.set(cache_key, deduped, timeout=GIFT_CARD_CACHE_TIMEOUT_SECONDS)
        return deduped
    except Exception:
        return []


def _build_sitemap_xml(request):
    today = timezone.now().date().isoformat()
    core_pages = [
        ("/", "daily", "1.0"),
        ("/about", "monthly", "0.7"),
        ("/contact", "monthly", "0.7"),
        ("/gift-cards", "daily", "0.95"),
        ("/signin", "monthly", "0.4"),
        ("/signup", "monthly", "0.5"),
        ("/top-up", "daily", "0.95"),
    ]

    type_cache = {}
    giftcard_items = _build_giftcard_sitemap_entries()
    sitemap_urls = [
        (
            _build_public_url(request, path),
            today,
            changefreq,
            priority,
        )
        for path, changefreq, priority in core_pages
    ]

    for item in giftcard_items:
        brand_name = ((item.get("brand") or {}).get("brandName")) or item.get("productName") or "Gift Card"
        brand_slug = _slugify(brand_name)

        if brand_slug and brand_slug not in type_cache:
            type_cache[brand_slug] = True
            sitemap_urls.append(
                (
                    _build_public_url(request, f"/gift-card/{brand_slug}"),
                    today,
                    "weekly",
                    "0.75",
                )
            )

        sitemap_urls.append(
            (
                _build_public_url(request, _build_giftcard_path(item, brand_name)),
                today,
                "weekly",
                "0.85",
            )
        )

    xml_items = [
        (
            "<url>"
            f"<loc>{escape(location)}</loc>"
            f"<lastmod>{lastmod}</lastmod>"
            f"<changefreq>{changefreq}</changefreq>"
            f"<priority>{priority}</priority>"
            "</url>"
        )
        for location, lastmod, changefreq, priority in sitemap_urls
    ]

    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        f"{''.join(xml_items)}"
        "</urlset>"
    )



class LoginWithEmailView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, format=None):
        import time
        
        email = request.data.get("email")
        password = request.data.get("password")
        # Validate email and password
        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        
        
        # Authenticate user
        user = authenticate(request, email=email, password=password)
        if user is not None:
            if user.deleted:
                return Response({'error': 'Email and password are required'}, status=status.HTTP_401_UNAUTHORIZED)
            if user.suspended:
                return Response({'error': 'Your account has been suspended. Please contact support.'}, status=status.HTTP_403_FORBIDDEN)
            token = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(token),
                'access': str(token.access_token),
                'user': UserSerializer(user).data,
            }, status=200)

        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
class GoogleLogin(APIView):
    permission_classes = [AllowAny]

    def _build_auth_response(self, request, user):
        if user.deleted:
            return Response(
                {'error': 'This account is no longer available.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if user.suspended:
            return Response(
                {'error': 'Your account has been suspended. Please contact support.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
        })

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        strategy = load_strategy(request)

        try:
            backend = load_backend(strategy=strategy, name='google-oauth2', redirect_uri=None)
            details = backend.user_data(token)
            email = details.get('email')
            email_verified = details.get('email_verified')

            if not email:
                return Response({'error': 'Invalid Google credentials.'}, status=status.HTTP_400_BAD_REQUEST)

            if not email_verified:
                return Response({'error': 'Email not verified by Google'}, status=status.HTTP_400_BAD_REQUEST)

            user = Account.objects.filter(email=email, auth_type='google').first()
            if not user:
                if Account.objects.filter(email=email).exclude(auth_type='google').exists():
                    return Response(
                        {
                            'error': 'This email address is already registered with email/password. Please sign in with your password.'
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                user = Account.objects.create_user(
                    email=email,
                    first_name=details.get('given_name'),
                    last_name=details.get('family_name'),
                    email_verified=email_verified,
                    auth_type='google',
                )
                user.set_unusable_password()
                user.save()

            return self._build_auth_response(request, user)

        except MissingBackend:
            return Response({'error': 'Google OAuth2 backend not configured properly'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)





class GoogleSignup(GoogleLogin):
    pass
        

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
            print(url);
            data = requests.get(url)
            # get or create rate percentages with defaults
            profile_entry, created = DigiShelfData.objects.get_or_create(
                id=1,
                defaults={
                    'profit_percentage': 5,
                    'processing_fee': 2,
                    'giftcard_processing_fee': 5
                }
            )
            percentage = profile_entry.profit_percentage
            processing = profile_entry.processing_fee
            giftcard_processing_fee = profile_entry.giftcard_processing_fee
            
            
            return Response({"data":data, "percentage":percentage, "processing":processing, "giftcard_processing_fee":giftcard_processing_fee}, status=200) 
        except Exception as e:
            print(f"Error fetching exchange rate: {e}")
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
        # Legacy placeholder. Top-up fulfillment now requires a confirmed payment first.
        
        
        pass
    
class GetGistCard(APIView):
    permission_classes= [AllowAny]
    def get(self, request):
        # get reloady data 

        type = request.GET.get("type", None)
        productId = request.GET.get("productId", None)
        page = request.GET.get("page", "1")
        size = request.GET.get("size", "60")
        cache_hash = hashlib.sha256(
            json.dumps(
                {"type": type, "productId": productId, "page": page, "size": size},
                sort_keys=True,
            ).encode("utf-8")
        ).hexdigest()
        cache_key = f"giftcards:{cache_hash}"

        cached = cache.get(cache_key)
        if cached is not None:
            return Response({"data": cached, "cached": True}, status=200)

        try:
            if productId:
                giftcard_url = urls.gift_card_product_id(productId)
            elif type:
                giftcard_url = urls.get_giftcard_url_two(type, "", page, size)
            else:
                giftcard_url = urls.get_giftcard_url_two("", "", page, size)

            reloady_object = reloady.Reloady(os.getenv("api_clien"),os.getenv("api_client_secret"), urls.token_url)
            audience = "https://giftcards-sandbox.reloadly.com"

            result = reloady_object.make_api_request(giftcard_url, "application/com.reloadly.giftcards-v1+json", audience)
            cache.set(cache_key, result, timeout=GIFT_CARD_CACHE_TIMEOUT_SECONDS)
            return Response({"data":result, "cached": False},status=200 )

        except Exception as e:
            print(e)
            return Response({"message":str(e) }, status=400)


class SitemapXmlView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        xml = _build_sitemap_xml(request)
        return HttpResponse(xml, content_type="application/xml")


class RobotsTxtView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        body = (
            "User-agent: GPTBot\n"
            "Disallow: /admin\n"
            "Disallow: /admin-login\n"
            "Disallow: /api/admin/\n"
            "\n"
            "User-agent: OAI-SearchBot\n"
            "Disallow: /admin\n"
            "Disallow: /admin-login\n"
            "Disallow: /api/admin/\n"
            "\n"
            "User-agent: Google-Extended\n"
            "Disallow: /admin\n"
            "Disallow: /admin-login\n"
            "Disallow: /api/admin/\n"
            "\n"
            "User-agent: *\n"
            "Allow: /\n"
            "Disallow: /admin\n"
            "Disallow: /admin-login\n"
            "Disallow: /api/admin/\n"
            f"Sitemap: {_build_public_url(request, '/sitemap.xml')}\n"
        )
        return HttpResponse(body, content_type="text/plain; charset=utf-8")

class ProcessPayment(APIView):
    permission_classes = [AllowAny]
    
    
    def post(self, request, *args, **kwargs):
        start_time = time.time()
        print("Starting executing code: ", start_time)
        transaction_data = dict(request.data.get('transaction') or {})
        payment_details_data = request.data.get('payment_details')
        user_device_data = request.data.get('user_device')
        order_product = transaction_data.get("products")
        

        try:
            with transaction.atomic():  # Start an atomic transaction
                # Create GiftCardTransaction
                # threads = []
                
                # Check if my balance i hihgter then process with payment 
                user_type = transaction_data.get("user_type")
                if isinstance(user_type, dict):
                    transaction_data["user"] = user_type.get("id")
                    transaction_data["user_type"] = "user"
                elif user_type == "guest" or not user_type:
                    transaction_data["user_type"] = "guest"
                else:
                    transaction_data["user_type"] = str(user_type)
                
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
                
                for index, prduct_data_request in enumerate(order_product):
                    tasks.make_api_requests.run(
                        prduct_data_request,
                        index,
                        transaction_data,
                        transaction_.id,
                    )

                completed_transactions = list(
                    transaction_.transactions_details_completed.all()
                )
                card_entries = build_giftcard_email_entries(completed_transactions)
                product_items = [
                    serialize_giftcard_product(item) for item in order_product or []
                ]
                   
                
                end_time = time.time()
                elapsed_time = end_time - start_time
                print(f"End time: {end_time} \n")
                print("How many seconds it took: ", elapsed_time, " s \n")

                if card_entries:
                    send_giftcard_codes_email(
                        send_order_update_email,
                        email=transaction_data.get("email"),
                        reference=transaction_data.get("reference"),
                        paid_amount=transaction_data.get("amount"),
                        payment_currency="USD",
                        card_entries=card_entries,
                        product_items=product_items,
                    )
                else:
                    send_order_update_email(
                        email=transaction_data.get("email"),
                        subject="Order update: gift card request received",
                        heading="Your gift card order is being processed",
                        preheader="We received your order and started processing your gift card purchase.",
                        status_label="Processing",
                        rows=[
                            {"label": "Reference", "value": transaction_data.get("reference")},
                            {"label": "Amount", "value": transaction_data.get("amount")},
                            {
                                "label": "Payment method",
                                "value": (transaction_data.get("payment_method") or "crypto").upper(),
                            },
                            {"label": "Items", "value": str(len(order_product or []))},
                        ],
                        product_items=product_items,
                    )

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


def send_order_update_email(
    *,
    email,
    subject,
    heading,
    preheader,
    rows,
    status_label,
    product_items=None,
):
    if not email:
        return

    context = {
        "subject": subject,
        "heading": heading,
        "preheader": preheader,
        "rows": rows,
        "status_label": status_label,
        "product_items": product_items or [],
        "site_name": "Digishelves",
        "support_email": getattr(settings, "DEFAULT_FROM_ADDRESS", "info@digishelves.com"),
    }

    html_content = render_to_string("emails/order_update.html", context)

    text_lines = [heading, preheader, ""]
    for row in rows:
        text_lines.append(f"{row['label']}: {row['value']}")
    if product_items:
        text_lines.append("")
        text_lines.append("Products:")
        for item in product_items:
            text_lines.append(f"- {item.get('product_name') or 'Gift card'}")
    text_lines.append("")
    text_lines.append("Need help? Contact info@digishelves.com")

    message = EmailMultiAlternatives(
        subject=subject,
        body="\n".join(text_lines),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email],
    )
    message.attach_alternative(html_content, "text/html")
    message.send(fail_silently=True)

 

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
    CACHE_TIMEOUT_SECONDS = int(
        os.getenv(
            "GIFT_CARD_SEARCH_CACHE_TIMEOUT_SECONDS",
            GIFT_CARD_CACHE_TIMEOUT_SECONDS,
        )
    )
    
    def get(self, request):
        country = request.GET.get("country", "").strip().upper()
        gift_card_name = request.GET.get("name", "").strip()
        page = request.GET.get("page", "1").strip() or "1"
        cache_payload = {
            "country": country,
            "name": gift_card_name.lower(),
            "page": page,
        }
        cache_hash = hashlib.sha256(
            json.dumps(cache_payload, sort_keys=True).encode("utf-8")
        ).hexdigest()
        cache_key = f"giftcard_search:{cache_hash}"

        cached_result = cache.get(cache_key)
        if cached_result is not None:
            return Response({"data": cached_result, "cached": True}, status=200)

        reloady_object = reloady.Reloady(
            os.getenv("api_clien"),
            os.getenv("api_client_secret"),
            urls.token_url,
        )
        audience = "https://giftcards-sandbox.reloadly.com"

        result = reloady_object.make_api_request(
            urls.get_giftcard_url_two(gift_card_name, country, page),
            "application/com.reloadly.giftcards-v1+json",
            audience,
        )

        exact_matches = result.get("content") if isinstance(result, dict) else None
        if exact_matches:
            cache.set(cache_key, exact_matches, timeout=self.CACHE_TIMEOUT_SECONDS)
            return Response(
                {"data": exact_matches, "cached": False, "fuzzy": False},
                status=200,
            )

        if gift_card_name:
            fuzzy_matches = _run_fuzzy_giftcard_search(gift_card_name, country, page)
            cache.set(cache_key, fuzzy_matches, timeout=self.CACHE_TIMEOUT_SECONDS)
            return Response(
                {"data": fuzzy_matches, "cached": False, "fuzzy": True},
                status=200,
            )

        empty_result = []
        cache.set(cache_key, empty_result, timeout=self.CACHE_TIMEOUT_SECONDS)
        return Response({"data": empty_result, "cached": False}, status=200)
        

            
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
        ).update(quantity=cart_quantity, updated_at=timezone.now())
        return Response({"data":"success"}, status=200)
        
        
    def delete(self, request, format=None):
        cartid = request.GET.get("id")
        object_ = models.Cart.objects.filter(pk=cartid).delete()
        return Response({"data":"success"}, status=200)


class AnalyticsEventView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        events = request.data.get("events")
        if events is None:
            events = [request.data]
        elif not isinstance(events, list):
            return Response({"error": "events must be a list."}, status=status.HTTP_400_BAD_REQUEST)

        if not events:
            return Response({"data": "ignored", "count": 0}, status=status.HTTP_200_OK)

        if len(events) > ANALYTICS_MAX_EVENTS_PER_REQUEST:
            return Response(
                {"error": f"Maximum {ANALYTICS_MAX_EVENTS_PER_REQUEST} events per request."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = serializers.AnalyticsEventSerializer(data=events, many=True)
        serializer.is_valid(raise_exception=True)

        user = _get_optional_request_user(request)
        ip_address = _get_client_ip(request)
        user_agent = (request.META.get("HTTP_USER_AGENT") or "")[:500]
        now = timezone.now()

        payload = [
            models.AnalyticsEvent(
                user=user,
                session_key=item["session_key"],
                event_type=item["event_type"],
                page_path=item.get("page_path") or None,
                page_title=item.get("page_title") or None,
                product_id=item.get("product_id") or None,
                product_name=item.get("product_name") or None,
                quantity=item.get("quantity", 0) or 0,
                duration_seconds=item.get("duration_seconds", 0) or 0,
                cart_item_count=item.get("cart_item_count", 0) or 0,
                cart_total_quantity=item.get("cart_total_quantity", 0) or 0,
                cart_total_value=_normalize_analytics_decimal(item.get("cart_total_value", "0.00")),
                metadata=item.get("metadata") or {},
                ip_address=ip_address,
                user_agent=user_agent,
                created_at=now,
            )
            for item in serializer.validated_data
        ]

        models.AnalyticsEvent.objects.bulk_create(payload)
        return Response({"data": "success", "count": len(payload)}, status=status.HTTP_201_CREATED)
        


class AirtimeTopUpPurcahse(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request, format=None):
        transaction_data = request.data.get("transaction")
        receiver_amount = request.data.get("receiverAmount")
        receiver_currency = request.data.get("receiverCurrency")
        amountPaid = request.data.get('AmountPaid') or request.data.get('amountPaid')
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
                payment_verification_data = None
                total_paid = amountPaid

                if payment_method == "cbc":
                    return Response(
                        {"error": "Card payments are disabled. Please use crypto payment."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if payment_method == "crypto":
                    from payments.models import Order

                    payment_order_id = request.data.get("paymentOrderId") or transaction_data.get("payment_order_id")
                    if not payment_order_id:
                        return Response(
                            {"error": "Missing crypto payment order."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    try:
                        payment_order = Order.objects.get(public_id=payment_order_id)
                    except (Order.DoesNotExist, ValueError):
                        try:
                            payment_order = Order.objects.get(pk=payment_order_id)
                        except (Order.DoesNotExist, ValueError):
                            payment_order = None

                    if payment_order is None:
                        return Response(
                            {"error": "Crypto payment order not found."},
                            status=status.HTTP_404_NOT_FOUND,
                        )

                    if payment_order.status != Order.Status.PAID:
                        return Response(
                            {"error": "Crypto payment is not confirmed yet."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    if amountPaid and float(payment_order.amount) < float(amountPaid):
                        return Response(
                            {"error": "Confirmed crypto payment is less than order total."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    total_paid = float(payment_order.amount)
                    payment_verification_data = {
                        "provider": "usdc_erc20",
                        "order_id": str(payment_order.public_id),
                        "wallet_address": payment_order.wallet_address,
                        "amount": str(payment_order.amount),
                        "status": payment_order.status,
                        "transaction_hash": payment_order.paid_transaction_hash,
                        "paid_at": payment_order.paid_at.isoformat() if payment_order.paid_at else None,
                    }
                else:
                    return Response(
                        {"error": "Unsupported payment method."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

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
                        "total_paid":total_paid,
                        "sender_currency":payment_currency,
                        "sender_country":country,
                        "processing_fee":proccessing_fee,
                        "payment_method": payment_method,
                        "email":email,
                        "reloader_transaction":response,
                        "paystack_very_transaction":payment_verification_data,
                        "status":response.get("status"),
                        "country":country,
                        
                    }
        
                    airtime_top_up_serializer = serializers.AirtimTopUpSerializer(data=data)
                    airtime_top_up_serializer.is_valid(raise_exception=True)
                    airtime_top_up_serializer.save();

                    send_order_update_email(
                        email=email,
                        subject="Order update: top-up completed",
                        heading="Your airtime top-up is complete",
                        preheader="Your top-up order was completed successfully.",
                        status_label="Completed",
                        rows=[
                            {"label": "Reference", "value": transaction_data.get("reference")},
                            {"label": "Operator", "value": operator_data.get("data").get("name")},
                            {"label": "Phone", "value": edited_number},
                            {
                                "label": "Recipient receives",
                                "value": f"{receiver_amount} {receiver_currency}",
                            },
                            {
                                "label": "You paid",
                                "value": f"{total_paid} {payment_currency}",
                            },
                        ],
                    )
                
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
        data = request.data
        formData = data.get("formData") or {}
        token = data.get("token")
        email = formData.get("email")
        remote_ip = request.META.get("REMOTE_ADDR")

        rate_limit = check_contact_rate_limit(email, remote_ip)
        if rate_limit:
            return Response(
                {
                    "error": "Too many contact requests. Please wait before sending another message.",
                    "retry_after": rate_limit["retry_after"],
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        try:
            is_captcha_valid = verify_recaptcha_token(
                token,
                remote_ip=remote_ip,
            )
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.RequestException:
            return Response(
                {"error": "Unable to verify reCAPTCHA right now. Please try again."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if not is_captcha_valid:
            return Response(
                {"error": "Invalid reCAPTCHA challenge. Please try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            contact_serializer = serializers.ContactSerializer(data=formData)
            contact_serializer.is_valid(raise_exception=True)
            contact = contact_serializer.save()
            send_contact_notification(contact)
            return Response({"data":"success"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
class UpdateProfile(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def post(self, request):
        data = request.data
        user = request.user                              
        
         # If "name" exists but not first_name/last_name, split it here
        if 'name' in data and ('first_name' not in data or 'last_name' not in data):
            full_name = data.get('name', '').strip()
            name_parts = full_name.split(' ')
            data['first_name'] = name_parts[0] if len(name_parts) > 0 else ''                             
            data['last_name'] = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''                 
        # update  user profile 
        user_serializer = serializers.UserSerializer(user, data=data, partial=True)
        if user_serializer.is_valid():
            user_serializer.save()
            return Response({"data":"success"}, status=200)
        else:
            return Response({"error":user_serializer.errors}, status=400)
    
        
    
        
class RecentActivityView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    
    def get(self, request):
        giftcard_qs = models.GiftCardTransaction.objects.filter(
            user=request.user
        ).prefetch_related(
            "transactions_order_product",
            "transactions_details_completed",
        )[:5]

        topup_qs = models.TopupTransaction.objects.filter(
            user=request.user
        )[:5]

        # Combine and sort all model instances
        combined = sorted(
            chain(giftcard_qs, topup_qs),
            key=attrgetter("created_at"),
            reverse=True
        )

        result = []
        for obj in combined:
            if isinstance(obj, models.GiftCardTransaction):
                reloadly_transactions = list(obj.transactions_details_completed.all())
                serialized_products = [
                    serialize_giftcard_product(product)
                    for product in obj.transactions_order_product.all()
                ]
                product_image_by_name = {
                    (item.get("product_name") or ""): item.get("product_image") or ""
                    for item in serialized_products
                    if item.get("product_name")
                }
                ready_cards = sum(
                    1
                    for item in reloadly_transactions
                    if item.redeem_data
                )
                total_cards = len(reloadly_transactions)
                cards = []
                for item in reloadly_transactions:
                    product_payload = {}
                    if item.product:
                        try:
                            product_payload = json.loads(item.product)
                        except (TypeError, ValueError, json.JSONDecodeError):
                            product_payload = {}

                    redeem_payload = []
                    if item.redeem_data:
                        try:
                            redeem_payload = json.loads(item.redeem_data)
                        except (TypeError, ValueError, json.JSONDecodeError):
                            redeem_payload = []

                    if not isinstance(redeem_payload, list):
                        redeem_payload = []

                    if redeem_payload:
                        cards.extend(
                            {
                                "product_name": product_payload.get("productName") or "Gift card",
                                "product_image": product_image_by_name.get(
                                    product_payload.get("productName") or ""
                                )
                                or "",
                                "card_number": redeem.get("cardNumber") or "",
                                "pin_code": redeem.get("pinCode") or "",
                                "status": item.status,
                            }
                            for redeem in redeem_payload
                        )
                serialized = {
                    "activity_type": "giftcard",
                    "reference": obj.reference,
                    "amount": str(obj.amount),
                    "country": obj.country,
                    "email": obj.email,
                    "user_type": obj.user_type,
                    "payment_method": obj.payment_method,
                    "created_at": obj.created_at,
                    "status": "completed" if total_cards and ready_cards == total_cards else "processing",
                    "product_count": obj.transactions_order_product.count(),
                    "products": serialized_products,
                    "ready_cards": ready_cards,
                    "total_cards": total_cards,
                    "cards": cards,
                }
            else:
                serialized = serializers.AirtimTopUpSerializer(obj).data
                serialized["activity_type"] = "topup"
            result.append(serialized)

        return Response({"data": result}, status=200)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        """
        Fetch the profile of the authenticated user.
        """
        user = request.user
        serializer = serializers.UserSerializer(user)
        return Response(serializer.data, status=200)
    
class AccountDeletionView(APIView):
    permission_classes = [IsAuthenticated]
    # authentication_classes = [JWTAuthentication]

    def delete(self, request):
        """
        Delete the authenticated user's account.
        """
        #instead of deleting the user set the delete field to true 
        
        # user = request.user
        user = request.user
        user.deleted = True
        user.save()
        return Response({"message": "Account deleted successfully."}, status=204)
