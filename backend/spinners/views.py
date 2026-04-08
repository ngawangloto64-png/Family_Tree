"""Views for the Spinner app."""

import random

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response

from .models import SpinnerPreset, SpinnerItem, SpinHistory
from .serializers import (
    SpinnerPresetSerializer,
    SpinnerPresetCreateSerializer,
    SpinHistorySerializer,
    SpinRequestSerializer,
    NumberSpinRequestSerializer,
)


class SpinnerPresetViewSet(viewsets.ModelViewSet):
    """CRUD for spinner presets."""
    queryset = SpinnerPreset.objects.all()

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return SpinnerPresetCreateSerializer
        return SpinnerPresetSerializer

    @action(detail=True, methods=['post'])
    def spin(self, request, pk=None):
        """Spin a saved preset and record the result."""
        preset = self.get_object()
        items = list(preset.items.all())
        if not items:
            return Response(
                {'error': 'Spinner has no items'},
                status=status.HTTP_400_BAD_REQUEST
            )

        weighted_items = []
        for item in items:
            weighted_items.extend([item] * item.weight)

        winner = random.choice(weighted_items)
        SpinHistory.objects.create(preset=preset, result=winner.label)

        return Response({
            'result': winner.label,
            'color': winner.color,
            'item_id': winner.id,
        })

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get spin history for a preset."""
        preset = self.get_object()
        history = preset.history.all()[:50]
        serializer = SpinHistorySerializer(history, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'])
    def clear_history(self, request, pk=None):
        """Clear spin history for a preset."""
        preset = self.get_object()
        preset.history.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def quick_spin(request):
    """Spin with ad-hoc items (no preset saved)."""
    serializer = SpinRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    items = serializer.validated_data['items']
    winner = random.choice(items)
    return Response({'result': winner})


@api_view(['POST'])
def number_spin(request):
    """Spin a random number in a range."""
    serializer = NumberSpinRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    min_val = serializer.validated_data['min_value']
    max_val = serializer.validated_data['max_value']

    if min_val >= max_val:
        return Response(
            {'error': 'min_value must be less than max_value'},
            status=status.HTTP_400_BAD_REQUEST
        )

    result = random.randint(min_val, max_val)
    return Response({'result': result, 'min': min_val, 'max': max_val})


@api_view(['POST'])
def yes_no_spin(request):
    """Simple Yes/No spinner."""
    result = random.choice(['Yes', 'No'])
    return Response({'result': result})


@api_view(['GET'])
def default_presets(request):
    """Return built-in default spinner configurations."""
    presets = {
        'names': {
            'title': 'Name Spinner',
            'type': 'name',
            'items': [
                {'label': 'Alice', 'color': '#FF6384'},
                {'label': 'Bob', 'color': '#36A2EB'},
                {'label': 'Charlie', 'color': '#FFCE56'},
                {'label': 'Diana', 'color': '#4BC0C0'},
                {'label': 'Eve', 'color': '#9966FF'},
                {'label': 'Frank', 'color': '#FF9F40'},
            ]
        },
        'numbers': {
            'title': 'Number Spinner (1-10)',
            'type': 'number',
            'items': [
                {'label': str(i), 'color': color}
                for i, color in zip(
                    range(1, 11),
                    ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                     '#FF9F40', '#C9CBCF', '#7BC67E', '#E77C8E', '#55BFC7']
                )
            ]
        },
        'colors': {
            'title': 'Color Spinner',
            'type': 'color',
            'items': [
                {'label': 'Red', 'color': '#FF0000'},
                {'label': 'Blue', 'color': '#0000FF'},
                {'label': 'Green', 'color': '#00AA00'},
                {'label': 'Yellow', 'color': '#FFD700'},
                {'label': 'Purple', 'color': '#800080'},
                {'label': 'Orange', 'color': '#FF8C00'},
                {'label': 'Pink', 'color': '#FF69B4'},
                {'label': 'Cyan', 'color': '#00CED1'},
            ]
        },
        'decisions': {
            'title': 'Decision Maker',
            'type': 'custom',
            'items': [
                {'label': 'Definitely Yes', 'color': '#4BC0C0'},
                {'label': 'Probably Yes', 'color': '#7BC67E'},
                {'label': 'Maybe', 'color': '#FFCE56'},
                {'label': 'Probably No', 'color': '#FF9F40'},
                {'label': 'Definitely No', 'color': '#FF6384'},
                {'label': 'Ask Again', 'color': '#9966FF'},
            ]
        },
    }
    return Response(presets)
