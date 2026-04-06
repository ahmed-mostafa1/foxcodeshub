from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from ads.models import AdPlacement
from .serializers import AdPlacementSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def get_active_placements(request):
    placements = AdPlacement.objects.filter(is_active=True)
    serializer = AdPlacementSerializer(placements, many=True)
    return Response(serializer.data)
