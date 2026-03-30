
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import *
from django.urls import path, include


# app_name = 'account'

urlpatterns = [
    path('auth/', include('drf_social_oauth2.urls', namespace='drf')),
    # path('api/token/', TokenObtainPairView.as_view(), name='get-token'),
    # path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh-token'),
    path('signup/', sign_up, name='signup'),
    path('dashboard/', user_details, name='dashboard'),
    path('user-details/<int:pk>/', user_details, name='user-details'),
    path('update-profile/', update_profile, name='update-profile'),
    path('options/', get_frameworks_os, name='options'),
    path('update-password/', update_password, name='update-password'),
    path('password-reset-request/', resetPasswordRequest,
         name='password-reser-request'),
    path('password-reset-check/<uid64>/<token>/', resetPasswordCheck,
         name='password-reset-check'),
    path('password-reset-confirm/', resetPasswordComplete,
         name='password-reset-confirm'),
    path('support/', handle_support, name='main-support'),
    path('support/<int:item>/', handle_support, name='item-support')

]
