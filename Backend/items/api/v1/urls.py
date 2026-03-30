from django.urls import path
from .views import *

app_name = 'items'

urlpatterns = [
    path('', home, name='home'),
    path('add-item/', create_item, name='add-item'),
    path('item-details/<int:pk>/', item_details, name='item-details'),
    path('items/all/', get_items, name='all-items'),
    path('items/<str:filter>/', get_items, name='filter-items',),
    path('catigories/', get_catigories, name='catigories'),
    path('options/<pk>/', get_options, name='options'),
    path('update-item/<int:pk>/', update_item, name='update-item'),
    path('delete-item/<int:pk>/', delete_item, name='delete-item'),
    path('handle-likes/<int:pk>/<str:operation>/',
         handleLike, name='handle-likes'),
    path('handle-wishlist/<int:pk>/<str:operation>/',
         handle_wish_list, name='handle-wishlist'),
    path('create-review/', create_review, name='create-review'),
    path('create-comment/', create_comment, name='create-comment'),
    path('download/<int:pk>/', download_file, name='download-file')
]
