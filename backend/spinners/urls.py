"""URL routes for the Spinner API."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'presets', views.SpinnerPresetViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('quick-spin/', views.quick_spin, name='quick-spin'),
    path('number-spin/', views.number_spin, name='number-spin'),
    path('yes-no-spin/', views.yes_no_spin, name='yes-no-spin'),
    path('defaults/', views.default_presets, name='default-presets'),
]
