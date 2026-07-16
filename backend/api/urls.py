from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import GoogleLogin, GoogleSignup, EmailSignUp, EmailVerificationView, ResendEmailVerificationView
from . import views
from . import admin_api

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('login/', views.LoginWithEmailView.as_view(), name="login_with_email"),
    path('api/social/google/', GoogleLogin.as_view(), name='google_login'),
    # path('api/social/facebook/', FacebookLogin.as_view(), name='facebook_login'),
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('auth/google/signup/', GoogleSignup.as_view(), name='google-signup'),
    path('auth/email/signup/', EmailSignUp.as_view(), name='google-signup'),
    path('auth/email/verify/', EmailVerificationView.as_view(), name='email-verify'),
    path('auth/email/resend-verification/', ResendEmailVerificationView.as_view(), name='email-resend-verification'),
    path('getoparator/',views.GetOperator.as_view(), name="get_oparator" ),
    path('exchange-rate/',views.FiatExchangeRate.as_view(), name="fia_exchange_rate"),
    path('giftcards/', views.GetGistCard.as_view(), name="giftcard"),
    path('process-payment/', views.ProcessPayment.as_view(), name="process_payment"),
    path('giftcardorder/', views.GetGiftCardOrder.as_view(), name="giftcardorder"),
    path('giftcard-search/', views.GetSearchResult.as_view(), name="giftcardseach"),
    path('cart/', views.CartView.as_view(), name="cart"),
    path('analytics/events/', views.AnalyticsEventView.as_view(), name="analytics_events"),
    path("aitimetopup/", views.AirtimeTopUpPurcahse.as_view(), name="airtime_top_up"),
    path("airtime-topup-order/", views.AirtimeSuccessOrder.as_view(), name="airtime_topup_order"),
    path("contact/", views.ContactView.as_view(), name="contact-us"),
    path("account/recent_activity/", views.RecentActivityView.as_view(), name="recent_activity"),
    path("account/update-profile/", views.UpdateProfile.as_view(), name="update_profile"),
    path('account/profile/', views.ProfileView.as_view(), name='profile'),
    path('account/delete/', views.AccountDeletionView.as_view(), name='delete_account'),
    path("admin/login/", admin_api.AdminLoginView.as_view(), name="digishelf_admin_login"),
    path("admin/configuration/", admin_api.AdminConfigurationView.as_view(), name="digishelf_admin_configuration"),
    path("admin/dashboard/", admin_api.AdminDashboardView.as_view(), name="digishelf_admin_dashboard"),
    path("admin/page-traffic/", admin_api.AdminPageTrafficView.as_view(), name="digishelf_admin_page_traffic"),
    path("admin/users/<int:user_id>/", admin_api.AdminUserDetailView.as_view(), name="digishelf_admin_user_detail"),
    path("admin/contacts/<int:contact_id>/read/", admin_api.AdminContactReadView.as_view(), name="digishelf_admin_contact_read"),
    path("admin/contacts/<int:contact_id>/reply/", admin_api.AdminContactReplyView.as_view(), name="digishelf_admin_contact_reply"),
    path("admin/payment-orders/<uuid:order_id>/approve/", admin_api.AdminApprovePaymentOrderView.as_view(), name="digishelf_admin_approve_order"),
    path("admin/payment-orders/<uuid:order_id>/complete/", admin_api.AdminCompletePaymentOrderView.as_view(), name="digishelf_admin_complete_order"),
    path("admin/payment-orders/<uuid:order_id>/", admin_api.AdminDeletePaymentOrderView.as_view(), name="digishelf_admin_delete_order"),
    path("admin/blocked-urls/", admin_api.AdminBlockedUrlListView.as_view(), name="digishelf_admin_blocked_urls"),
    path("admin/blocked-urls/manage/", admin_api.AdminBlockedUrlAdminListView.as_view(), name="digishelf_admin_blocked_urls_manage"),
    path("admin/blocked-urls/<int:entry_id>/", admin_api.AdminBlockedUrlDetailView.as_view(), name="digishelf_admin_blocked_url_detail"),


    
]
