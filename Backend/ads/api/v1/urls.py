from django.urls import path
from .views import get_active_placements

urlpatterns = [
    path('placements/', get_active_placements, name='ad-placements'),
]
