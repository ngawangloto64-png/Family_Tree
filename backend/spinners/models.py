"""Models for the Spinner app."""

import random
from django.db import models


class SpinnerPreset(models.Model):
    """A saved spinner configuration with items."""

    SPINNER_TYPES = [
        ('name', 'Name Spinner'),
        ('number', 'Number Spinner'),
        ('custom', 'Custom Spinner'),
        ('yesno', 'Yes/No Spinner'),
        ('color', 'Color Spinner'),
    ]

    title = models.CharField(max_length=200)
    spinner_type = models.CharField(max_length=20, choices=SPINNER_TYPES, default='custom')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title} ({self.get_spinner_type_display()})"


class SpinnerItem(models.Model):
    """An individual item/segment on a spinner."""

    preset = models.ForeignKey(SpinnerPreset, on_delete=models.CASCADE, related_name='items')
    label = models.CharField(max_length=200)
    color = models.CharField(max_length=7, default='#FF6384')
    weight = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.label


class SpinHistory(models.Model):
    """History of spin results."""

    preset = models.ForeignKey(SpinnerPreset, on_delete=models.CASCADE, related_name='history')
    result = models.CharField(max_length=200)
    spun_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-spun_at']
        verbose_name_plural = 'Spin histories'

    def __str__(self):
        return f"{self.result} (from {self.preset.title})"
