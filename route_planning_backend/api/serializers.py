from rest_framework import serializers
from .models import LogSheetActivity, Trip, LogSheet

class LogSheetActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = LogSheetActivity
        fields = '__all__'

class LogSheetSerializer(serializers.ModelSerializer):
    log_sheet_activities = LogSheetActivitySerializer(many=True, read_only=True)

    class Meta:
        model = LogSheet
        fields = '__all__'

class TripSerializer(serializers.ModelSerializer):
    log_sheets = LogSheetSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = '__all__'

