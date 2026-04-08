"""Serializers for the Spinner app."""

from rest_framework import serializers
from .models import SpinnerPreset, SpinnerItem, SpinHistory


class SpinnerItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpinnerItem
        fields = ['id', 'label', 'color', 'weight']


class SpinHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SpinHistory
        fields = ['id', 'result', 'spun_at']


class SpinnerPresetSerializer(serializers.ModelSerializer):
    items = SpinnerItemSerializer(many=True, read_only=True)

    class Meta:
        model = SpinnerPreset
        fields = ['id', 'title', 'spinner_type', 'items', 'created_at', 'updated_at']


class SpinnerPresetCreateSerializer(serializers.ModelSerializer):
    items = SpinnerItemSerializer(many=True)

    class Meta:
        model = SpinnerPreset
        fields = ['id', 'title', 'spinner_type', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        preset = SpinnerPreset.objects.create(**validated_data)
        for item_data in items_data:
            SpinnerItem.objects.create(preset=preset, **item_data)
        return preset

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        instance.title = validated_data.get('title', instance.title)
        instance.spinner_type = validated_data.get('spinner_type', instance.spinner_type)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                SpinnerItem.objects.create(preset=instance, **item_data)

        return instance


class SpinRequestSerializer(serializers.Serializer):
    """For ad-hoc spins without saving a preset."""
    items = serializers.ListField(child=serializers.CharField(max_length=200), min_length=2)


class NumberSpinRequestSerializer(serializers.Serializer):
    """For number range spins."""
    min_value = serializers.IntegerField(default=1)
    max_value = serializers.IntegerField(default=100)
