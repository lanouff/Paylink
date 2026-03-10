from rest_framework import serializers
from .models import PaymentRequest


class PaymentRequestSerializer(serializers.ModelSerializer):
    requester_username = serializers.CharField(source="requester.username", read_only=True)
    payer_username = serializers.CharField(source="payer_user.username", read_only=True)

    class Meta:
        model = PaymentRequest
        fields = [
            "id",
            "requester",
            "requester_username",
            "payer_username",
            "target_handle",
            "amount_in_minor",
            "currency",
            "note",
            "status",
            "created_at",
            "paid_at",
        ]
        read_only_fields = [
            "id",
            "requester",
            "requester_username",
            "payer_username",
            "status",
            "created_at",
            "paid_at",
        ]