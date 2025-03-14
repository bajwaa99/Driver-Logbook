from .serializers import LogSheetActivitySerializer, LogSheetSerializer, TripSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
def calculate_trip(request):
    trip_serializer = TripSerializer(data=request.data)
    if trip_serializer.is_valid():
        trip = trip_serializer.save()

        log_sheets_data = request.data.get('log_sheets')
        for log_sheet_data in log_sheets_data:
            log_sheet_serializer = LogSheetSerializer(data={**log_sheet_data, 'trip': trip.id})
            if log_sheet_serializer.is_valid():
                log_sheet = log_sheet_serializer.save()

                log_sheet_activities_data = log_sheet_data.get('log_sheet_activities')
                for activity_data in log_sheet_activities_data:
                    activity_data['log_sheet'] = log_sheet.id
                log_sheet_activities_serializer = LogSheetActivitySerializer(data=log_sheet_activities_data, many=True)
                if log_sheet_activities_serializer.is_valid():
                    log_sheet_activities_serializer.save(log_sheet=log_sheet)
                else:
                    trip.delete()
                    return Response(log_sheet_activities_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                return Response(TripSerializer(trip).data, status=status.HTTP_201_CREATED)
            else:
                trip.delete()
                return Response(log_sheet_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(trip_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

