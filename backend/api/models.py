from django.conf import settings
from django.db import models
from django.core.validators import RegexValidator


handle_validator = RegexValidator(
    regex=r"^[a-z0-9_]{3,20}$",
    message="Handle must be 3-20 chars, lowercase letters/numbers/underscore only."
)


class Handle(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="handle",
    )
    handle = models.CharField(
        max_length=20,
        unique=True,
        validators=[handle_validator],
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"@{self.handle}"
