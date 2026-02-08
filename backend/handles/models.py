from django.db import models


class Handle(models.Model):
    value = models.CharField(max_length=30, unique=True)
    display_name = models.CharField(max_length=60, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.value
