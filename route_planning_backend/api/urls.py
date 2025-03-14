from django.urls import path
from . import views

urlpatterns = [
    path('trip/calculate/', views.calculate_trip, name='calculate_trip'),
]