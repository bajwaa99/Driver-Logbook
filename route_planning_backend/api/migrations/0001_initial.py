# Generated by Django 5.1.7 on 2025-03-13 08:35

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='LogSheet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('carrier_name', models.CharField(max_length=255)),
                ('truck_number', models.CharField(max_length=255)),
                ('trailer_number', models.CharField(max_length=255)),
                ('main_office_address', models.CharField(max_length=255)),
                ('home_terminal_address', models.CharField(max_length=255)),
                ('total_miles_drove', models.FloatField()),
                ('total_mileage', models.FloatField()),
                ('dvl_manifest_no', models.CharField(blank=True, max_length=255, null=True)),
                ('shipper_commodity', models.CharField(blank=True, max_length=255, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Trip',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('current_location', models.CharField(max_length=255)),
                ('pickup_location', models.CharField(max_length=255)),
                ('dropoff_location', models.CharField(max_length=255)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='LogSheetActivity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('status', models.CharField(choices=[('OFF_DUTY', 'Off Duty'), ('DRIVING', 'Driving'), ('ON_DUTY', 'On Duty'), ('SLEEPER_BERTH', 'Sleeper Berth')], max_length=20)),
                ('stop_location', models.CharField(blank=True, max_length=255, null=True)),
                ('remarks', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('log_sheet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='log_sheet_activities', to='api.logsheet')),
            ],
        ),
        migrations.AddField(
            model_name='logsheet',
            name='trip',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='log_sheets', to='api.trip'),
        ),
    ]
