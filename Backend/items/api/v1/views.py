from charset_normalizer import api
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from .seriaizers import *
from items.models import *
from django.db.models import Count
import mimetypes
from django.http import HttpResponse, HttpResponseForbidden
from django.db.models import Q


User = get_user_model()


@api_view(['POST'])
def create_item(request):

    main_data = request.data.copy()
    main_data['seller'] = request.user.id
    del main_data['frameworks']
    del main_data['file_types']

    frameworks = Framework.objects.filter(
        pk__in=request.data['frameworks'])
    file_types = FileType.objects.filter(
        pk__in=request.data['file_types'])
    ser_item = ItemSerializer(data=main_data)
    if ser_item.is_valid():
        item = ser_item.save()
        item.frameworks.add(*frameworks)
        item.file_types.add(*file_types)
        item.file_url = main_data['file_url']
        item.save()

        return Response(data=ItemSerializer(instance=item).data, status=status.HTTP_201_CREATED)
    return Response(data=ser_item.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def update_item(request, pk):
    qs = Item.objects.filter(id=pk)
    if qs.exists():
        item = qs.first()
        if item.seller != request.user:
            return Response(data={'error': 'unacceptable request'}, status=status.HTTP_403_FORBIDDEN)
        main_data = request.data.copy()

        try:
            del main_data['frameworks']
            frameworks = Framework.objects.filter(
                pk__in=request.data['frameworks'])
            del main_data['file_types']
            file_types = FileType.objects.filter(
                pk__in=request.data['file_types'])
        except:
            frameworks = None
            file_types = None


        ser_item = ItemSerializer(
            instance=item,
            data=main_data,
            partial=True
        )
        if ser_item.is_valid():
            ser_item.save()
            item.last_update = timezone.now()
            try:
                item.file_url = main_data['file_url']
            except:
                pass
            if frameworks != None and file_types != None:
                item.frameworks.clear()
                item.file_types.clear()
                item.frameworks.add(*frameworks)
                item.file_types.add(*file_types)
            item.save()
            for i in range(1, 9):
                try:
                    screen = ScreenShots()
                    screen.image = request.data[f'screen{i}']
                    screen.item = item
                    screen.save()
                except:
                    pass
            return Response(data={'success': 'updated successfully'}, status=status.HTTP_200_OK)
        return Response(data=ser_item.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(data={'error': 'Item Not Found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def item_details(request, pk):
    try:
        item = Item.objects.get(pk=pk)
        ser_item = ItemSerializer(instance=item)
        data = ser_item.data
        data['catigory'] = Catigory.objects.get(pk=data['catigory']).name

        data['sub_catigory'] = SubCatigory.objects.get(
            pk=data['sub_catigory']).name
        seller = User.objects.get(pk=data['seller'])
        data['seller'] = {
            'username': seller.username,
            'profile_pic': '' if not seller.profile_pic else seller.profile_pic.url,
            'devtype': seller.devtype,
            'id': seller.id
        }

        return Response(data=data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(data={'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def get_items(request, **kwargs):
    if kwargs:
        filter = kwargs['filter'].split('=')
        if filter[0] == 'catigory':
            items = Item.objects.filter(catigory__id=filter[1])
        elif filter[0] == 'sub_catigory':
            try:
                id = int(filter[1])
                items = Item.objects.filter(sub_catigory__id=id)
            except:
                items = Item.objects.filter(sub_catigory__name=filter[1])
    else:
        items = Item.objects.all()
    try:
        ser_items = ItemSerializer(instance=items, many=True)
        return Response(data=ser_items.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(data={'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def home(request):
    items = Item.objects.all()
    new_items = ItemSerializer(
        instance=items.order_by('-relased_date')[0:12],
        many=True
    )

    most_selled = ItemSerializer(
        instance=items.annotate(dcount=Count(
            'downloads')).order_by('-dcount')[0:12],
        many=True
    )

    most_liked = ItemSerializer(
        instance=items.annotate(lcount=Count(
            'likes')).order_by('-lcount')[0:12],
        many=True
    )

    hot_deals = ItemSerializer(
        instance=items.filter(~Q(discount_price=None))[0:12],
        many=True
    )

    data = {
        "new_items": new_items.data,
        "most_selled": most_selled.data,
        'most_liked': most_liked.data,
        'hot_deals': hot_deals.data
    }
    return Response(data=data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def get_catigories(request):

    catigories = CatigorySerializer(
        instance=Catigory.objects.all(),
        many=True
    )
    return Response(data=catigories.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_options(request, pk):
    if type(pk) is str:
        subcatigories = SubCatigorySerializer(
            instance=SubCatigory.objects.filter(catigory=pk),
            many=True
        )
        framework_types = FrameworkTypeSerializer(
            instance=FrameworkType.objects.filter(catigory=pk),
            many=True
        )
    else:
        subcatigories = SubCatigorySerializer(
            instance=SubCatigory.objects.filter(catigory__id=pk),
            many=True
        )
        framework_types = FrameworkTypeSerializer(
            instance=FrameworkType.objects.filter(catigory__id=pk),
            many=True
        )

    file_types = FileTypeSerializer(
        instance=FileType.objects.all(),
        many=True
    )
    data = {
        'subcatigories': subcatigories.data,
        'framework_types': framework_types.data,
        'file_types': file_types.data
    }
    return Response(data=data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def delete_item(request, pk):
    qs = Item.objects.filter(id=pk)
    if qs.exists():
        item = qs.first()
        if request.user.is_staff or request.user == item.seller:
            item.delete()
            return Response(data={'success': 'item deleted successfully'}, status=status.HTTP_200_OK)
        return Response(data={'error': "you dont have permession to delete this item"}, status=status.HTTP_403_FORBIDDEN)
    return Response(data={'error': 'item not found'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def handleLike(request, **kwargs):
    qs = Item.objects.filter(id=kwargs['pk'])
    if qs.exists():
        item = qs.first()
        if kwargs['operation'] == 'like':
            like = Like.objects.create(item=item, user=request.user)
            data = {'success': 'you like this item'}
        elif kwargs['operation'] == 'unlike':
            like = Like.objects.get(user=request.user, item=item)
            like.delete()
            data = {'success': 'you unlike this item'}
        return Response(data=data, status=status.HTTP_200_OK)
    return Response(data={'error': 'item not found'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def handle_wish_list(request, **kwargs):
    item = get_object_or_404(Item, pk=kwargs['pk'])
    wishlist, created = Wishlist.objects.get_or_create(user=request.user)
    data = {}
    if kwargs['operation'] == 'add':
        wishlist.items.add(item)
        data = {'success': 'item added to your wishlist'}
    elif kwargs['operation'] == 'remove':
        wishlist.items.remove(item)
        data = {'success': 'item removed your wishlist'}
    return Response(data=data, status=status.HTTP_200_OK)


@api_view(['POST'])
def create_review(request):
    item = get_object_or_404(Item, pk=request.data['item'])
    review = Review.objects.create(
        user=request.user,
        item=item,
        content=request.data['content']
    )
    return Response(data=ReviewSerializer(instance=review).data, status=status.HTTP_200_OK)


@api_view(['POST'])
def create_comment(request):
    item = get_object_or_404(Item, pk=request.data['item'])
    comment = Comment.objects.create(
        user=request.user,
        item=item,
        content=request.data['content']
    )
    return Response(data=CommentSerializer(instance=comment).data, status=status.HTTP_200_OK)


@api_view(['GET'])
def download_file(request, pk):
    # fill these variables with real values
    item = get_object_or_404(Item, pk=pk)
    user_downloads = []
    for i in request.user.payments.all():
        user_downloads.append(i.item)

    if item in user_downloads:
        # fl_path = item.zip_file.path
        # print(fl_path)
        # filename = f'{item.name}.zip'
        # fl = open(fl_path, 'rb')
        # mime_type, _ = mimetypes.guess_type(fl_path)
        # response = HttpResponse(fl, content_type=mime_type)
        # response['Content-Disposition'] = "attachment; filename=%s" % filename
        # return response
        return Response(data={'url': item.file_url}, status=status.HTTP_200_OK)
    return HttpResponseForbidden()
