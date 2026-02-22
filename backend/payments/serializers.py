from rest_framework import serializers
from .models import PaymentRequest


class PaymentRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentRequest
        fields = "__all__"
        read_only_fields = ["requester", "status", "created_at"]