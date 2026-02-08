from rest_framework import serializers
from .models import Handle


class HandleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Handle
        fields = ["id", "value", "display_name", "created_at"]
        read_only_fields = ["id", "created_at"]