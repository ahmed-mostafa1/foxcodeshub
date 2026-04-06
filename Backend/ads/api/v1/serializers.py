from rest_framework import serializers
from ads.models import AdPlacement


class AdPlacementSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdPlacement
        fields = ['location', 'client_id', 'slot_id']
