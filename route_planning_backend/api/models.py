from django.db import models

# Create your models here.
class Trip(models.Model):
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)

    start_date = models.DateField()
    end_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Trip from {self.current_location} to {self.dropoff_location}"

class LogSheetActivity(models.Model):
    start_time = models.TimeField()
    end_time = models.TimeField()

    status = models.CharField(
    max_length=20,
    choices=[
        ('OFF_DUTY', 'Off Duty'),
        ('DRIVING', 'Driving'),
        ('ON_DUTY', 'On Duty'),
        ('SLEEPER_BERTH', 'Sleeper Berth'),  # If needed
    ]
    )
    stop_location = models.CharField(max_length=255, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)

    log_sheet = models.ForeignKey('LogSheet', on_delete=models.CASCADE, related_name='log_sheet_activities')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.status} from {self.start_time} to {self.end_time}"

    

class LogSheet(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='log_sheets')

    date = models.DateField()

    carrier_name = models.CharField(max_length=255)
    truck_number = models.CharField(max_length=255)
    trailer_number = models.CharField(max_length=255)

    main_office_address = models.CharField(max_length=255)
    home_terminal_address = models.CharField(max_length=255)
    total_miles_drove = models.FloatField()
    total_mileage = models.FloatField()
    dvl_manifest_no = models.CharField(max_length=255, blank=True, null=True)
    shipper_commodity = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Log Sheet for {self.date} (Trip: {self.trip.id})"