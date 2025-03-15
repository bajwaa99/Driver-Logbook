import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    TextField,
    Button,
    Typography,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn'; // Import Location Icon
import LocationMap from './LocationMap'; // Import LocationMap
import LogBook from './LogBook';
import LeafletMap from './LeafletMap';
import TimePickerWithHHMM from './TimePicker';
import { validateEndTime } from './utils';

function LogForm() {
    const [logbookData, setLogbookData] = useState({}); // Initialize logbookData state
    const [coordinates, setCoordinates] = useState([]);
    const [logData, setLogData] = useState({
        current_location: '',
        pickup_location: '',
        dropoff_location: '',
        current_cycle_hours: 0,
        start_date: '',
        end_date: '',
        current_location_coords: null,
        pickup_location_coords: null,
        dropoff_location_coords: null,
        log_sheets: [
            {
                date: '',
                carrier_name: '',
                truck_number: '',
                trailer_number: '',
                main_office_address: '',
                home_terminal_address: '',
                total_miles_drove: 0,
                total_mileage: 0,
                dvl_manifest_no: '',
                shipper_commodity: '',
                log_sheet_activities: [],
            },
        ],
    });

    const [logSheetActivityData, setLogSheetActivityData] = useState( 
    [{
        start_time: '00:00',
        end_time: '',
        status: 'OFF_DUTY',
        remarks: '',
        stop_location: '',
        is_start_disabled: true,
        is_end_disabled: false,
    }]
    );
    console.log(logSheetActivityData);

    const [openMapDialog, setOpenMapDialog] = useState(false);
    const [selectedField, setSelectedField] = useState('');

    const handleAddActivity = () => {
        console.log("handleAddActivity");
        setLogSheetActivityData((prevData) => {
            const updatedPrevData = prevData.map((activity, index) => {
                if (index === prevData.length - 1) { // Check if it's the last element
                    return { ...activity, is_end_disabled: true }; // Create a new object with the updated property
                }
                return activity;
            });
            const lastElement = updatedPrevData[updatedPrevData.length - 1];
            const newActivity = {
                start_time: lastElement.end_time,
                end_time: '',
                status: 'OFF_DUTY',
                remarks: '',
                stop_location: '',
                is_start_disabled: true,
                is_end_disabled: false,
            };
            return [...updatedPrevData, newActivity];
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const [field, index] = name.split('.');
        if (index) {
            setLogData((prevData) => {
                const log_sheets = [...prevData.log_sheets];
                log_sheets[0][field] = value;
                return { ...prevData, log_sheets };
            });
        } else {
            setLogData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const handleActivityInputChange = (e) => {
        const { name, value } = e.target;
        const [field, index, subField] = name.split('.');
        console.log("name",name,field);
    
        setLogSheetActivityData((prevData) => {
            const updatedActivities = [...prevData];
            const activity = updatedActivities[index]; // Get the current activity
    
            if (subField === 'end_time') {
                // Validation: end_time should be greater than start_time
                if (activity.start_time && value <= activity.start_time) {
                    // You might want to show an error message to the user here
                    console.error("End time must be after start time", value,"start=", activity.start_time);
                    // alert('End time must be after start time.');
                    return prevData; // Prevent the update and return the previous state
                }
            }
    
            updatedActivities[index][subField] = value;
            return updatedActivities;
        });
    };

    const handleTimeChange = (timeString, index, field) => {
        setLogSheetActivityData((prevData) => {
            const updatedActivities = [...prevData];
            const activity = updatedActivities[index]; // Get the current activity
            console.log("timeString",timeString !== "00:00")
            if (activity.start_time && timeString <= activity.start_time && timeString !== "00:00") {
                // You might want to show an error message to the user here
                console.error("End time must be after start time", timeString,"start=", activity.start_time);
                return prevData; // Prevent the update and return the previous state
            }
            updatedActivities[index][field] = timeString;
            return updatedActivities;
        });
    };

    const handleLocationSelect = (field, coords) => {
        setLogData((prevData) => ({
            ...prevData,
            [`${field}_coords`]: coords,
            [field]: `${coords.lat}, ${coords.lng}`, // Update the text field with coordinates
        }));
        setOpenMapDialog(false);
    };

    const handleOpenMapDialog = (field) => {
        setSelectedField(field);
        setOpenMapDialog(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...logData,
                log_sheets: logData.log_sheets.map((sheet) => ({
                    ...sheet,
                    log_sheet_activities: logSheetActivityData,
                })),
            };
            const response = await axios.post('https://driver-logbook-backend.vercel.app/api/trip/calculate/', payload);
            setLogbookData(response.data);   
            // alert('Log submitted successfully!');
        } catch (error) {
            console.error(error);
            alert('Error submitting log.');
        }
    };
    console.log("logbookData",logbookData?.log_sheets?.[0]);

    useEffect(() => {
        const coordinates = [];
        if (logbookData?.current_location) coordinates.push(logbookData?.current_location.split(',').map(Number));
        if (logbookData?.pickup_location)
        coordinates.push(logbookData?.pickup_location.split(',').map(Number));
        
        logbookData?.log_sheets?.[0]?.log_sheet_activities?.forEach((activityData) => {
            if (activityData.stop_location) {
                coordinates.push(activityData.stop_location.split(',').map(Number));
            }
        }
        );
        if (logbookData?.dropoff_location)
        coordinates.push(logbookData?.dropoff_location.split(',').map(Number));
        setCoordinates(coordinates);
    }, [logbookData]);

    return (
        <>
        {logbookData?.log_sheets ? 
            <><LogBook logData={logbookData}/>
            <LeafletMap coordinates={coordinates} /></> : 
        <form onSubmit={handleSubmit} style={{margin: '20px'}}>
            <Typography variant="h6" component="h2">
                Trip Details
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center', width: 400 }}>
                <TextField
                    margin="normal"
                    fullWidth
                    label="Current Location"
                    name="current_location"
                    value={logData.current_location}
                    onChange={handleInputChange}
                    onClick={() => handleOpenMapDialog('current_location')}
                />
                <IconButton onClick={() => handleOpenMapDialog('current_location')}>
                    <LocationOnIcon />
                </IconButton>
            </div>
            <div style={{ display: 'flex', alignItems: 'center',  width: 400 }}>
                <TextField
                    margin="normal"
                    fullWidth
                    label="Pickup Location"
                    name="pickup_location"
                    value={logData.pickup_location}
                    onChange={handleInputChange}
                    onClick={() => handleOpenMapDialog('pickup_location')}
                />
                <IconButton onClick={() => handleOpenMapDialog('pickup_location')}>
                    <LocationOnIcon />
                </IconButton>
            </div>
            <div style={{ display: 'flex', alignItems: 'center',  width: 400 }}>
                <TextField
                    margin="normal"
                    fullWidth
                    label="Dropoff Location"
                    name="dropoff_location"
                    value={logData.dropoff_location}
                    onChange={handleInputChange}
                    onClick={() => handleOpenMapDialog('dropoff_location')}
                />
                <IconButton onClick={() => handleOpenMapDialog('dropoff_location')}>
                    <LocationOnIcon />
                </IconButton>
            </div>
            <TextField
                margin="normal"
                fullWidth
                label="Current Cycle Hours"
                name="current_cycle_hours"
                type="number"
                value={logData.current_cycle_hours}
                onChange={handleInputChange}
                style={{ width: 400 }}
            />
            <p>Start Date:</p>
            <TextField
                margin="normal"
                fullWidth
                name="start_date"
                type="date"
                value={logData.start_date}
                onChange={handleInputChange}
                style={{ width: 400, marginTop: '0px' }}
            />
            <p>End Date:</p>
            <TextField
                margin="normal"
                fullWidth
                name="end_date"
                type="date"
                value={logData.end_date}
                onChange={handleInputChange}
                style={{ width: 400, marginTop: '0px' }}
            />
            <Typography variant="h6" component="h2" style={{borderTop: '1px solid #ccc', paddingTop: '10px'}}>
                Log Sheet Details
            </Typography>

            {/* Input fields for log sheet data */}
            <p>Date:</p>
            <TextField
                margin="normal"
                fullWidth
                name="date.0"
                type="date"
                value={logData.log_sheets[0].date}
                onChange={handleInputChange}
                style={{ width: 400, margin: '0px' }}
            />
            <div>
            
            <TextField
                label="Carrier Name"
                type="text"
                name="carrier_name.0"
                value={logData.log_sheets[0].carrier_name}
                onChange={handleInputChange}
                style={{ width: 400, marginTop: '10px' }}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Truck Number"
                name="truck_number.0"
                value={logData.log_sheets[0].truck_number}
                onChange={handleInputChange}
                style={{ width: 400, marginLeft: '10px', marginTop: '10px' }}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Trailer Number"
                name="trailer_number.0"
                value={logData.log_sheets[0].trailer_number}
                onChange={handleInputChange}
                style={{ width: 400, marginLeft: '10px', marginTop: '10px' }}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Main Office Address"
                name="main_office_address.0"
                value={logData.log_sheets[0].main_office_address}
                onChange={handleInputChange}
                style={{ width: 400, marginLeft: '10px', marginTop: '10px' }}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Home Terminal Address"
                name="home_terminal_address.0"
                value={logData.log_sheets[0].home_terminal_address}
                onChange={handleInputChange}
                style={{ width: 400, marginLeft: '0px', marginTop: '10px' }}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Total Miles Drove"
                name="total_miles_drove.0"
                type="number"
                value={logData.log_sheets[0].total_miles_drove}
                onChange={handleInputChange}
                style={{ width: 400, marginLeft: '10px', marginTop: '10px' }}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Total Mileage"
                name="total_mileage.0"
                type="number"
                value={logData.log_sheets[0].total_mileage}
                onChange={handleInputChange}
                style={{ width: 400, marginLeft: '10px', marginTop: '10px' }}
            />
            <TextField
                margin="normal"
                fullWidth
                label="DVL Manifest No"
                name="dvl_manifest_no.0"
                value={logData.log_sheets[0].dvl_manifest_no}
                onChange={handleInputChange}
                style={{ width: 400, marginLeft: '10px', marginTop: '10px' }}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Shipper Commodity"
                name="shipper_commodity.0"
                value={logData.log_sheets[0].shipper_commodity}
                onChange={handleInputChange}
                style={{ width: 400, marginLeft: '0px', marginTop: '10px' }}
            />
            </div>
            {/* ... other log sheet input fields ... */}

            <Typography variant="h6" component="h2" style={{borderTop: '1px solid #ccc', paddingTop: '20px'}}>
                Log Sheet Activities
            </Typography>

            {logSheetActivityData.map((activity, index) => (
                <div key={index} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', display: 'flex', }}>
                    {/* <TextField
                        type="time"
                        name={`logSheetActivityData.${index}.start_time`}
                        label="Start Time"
                        value={activity.start_time}
                        onChange={handleActivityInputChange}
                        disabled={activity.is_start_disabled}
                    /> */}
                    <div style={{margin: '0px 10px'}}>
                     <TimePickerWithHHMM label={"Start Time"} disabled={activity.is_start_disabled} timeString={activity.start_time} setTimeString={(time)=>handleTimeChange(time, index, "start_time")}/>
                     </div>
                     <div style={{margin: '0px 10px'}}>
                     <TimePickerWithHHMM label={"End Time"} disabled={activity.is_end_disabled} timeString={activity.end_time} setTimeString={(time)=>handleTimeChange(time, index, "end_time")}  validateTime={(endTime) => validateEndTime(endTime, activity.start_time)}
                        />
                     </div>
                     <div style={{margin: '0px 10px'}}>
                    <FormControl>
                        <InputLabel id={`status-label-${index}`}>Status</InputLabel>
                        <Select
                            labelId={`status-label-${index}`}
                            name={`logSheetActivityData.${index}.status`}
                            value={activity.status}
                            label="Status"
                            onChange={handleActivityInputChange}
                        >
                            <MenuItem value="OFF_DUTY">Off Duty</MenuItem>
                            <MenuItem value="SLEEPER_BERTH">Sleeper Berth</MenuItem>
                            <MenuItem value="DRIVING">Driving</MenuItem>
                            <MenuItem value="ON_DUTY">On Duty</MenuItem>
                        </Select>
                    </FormControl>
                    </div>
                    <div style={{margin: '0px 10px'}}>
                    <TextField
                        name={`logSheetActivityData.${index}.remarks`}
                        label="Remarks"
                        value={activity.remarks}
                        onChange={handleActivityInputChange}
                    />
                    </div>
                    
                <TextField
                style={{ width: 400, margin: '0px 10px' }}
                    margin="normal"
                    fullWidth
                    label="Stop Location"
                    name={`logSheetActivityData.${index}.stop_location`}
                    value={activity.stop_location}
                    onChange={handleActivityInputChange}
                    onClick={() => handleOpenMapDialog(`stop_location`)}
                />
                <IconButton onClick={() => handleOpenMapDialog(`stop_location`)}>
                    <LocationOnIcon />
                </IconButton>
                </div>
            ))}

            <Button disabled={!logSheetActivityData?.[logSheetActivityData.length-1].end_time} onClick={()=>handleAddActivity()}>Add More Activity</Button>

            <Button type="submit">Submit Log</Button>

            <Dialog open={openMapDialog} onClose={() => setOpenMapDialog(false)}>
                <DialogTitle>Select Location</DialogTitle>
                <DialogContent>
                    <LocationMap
                        onLocationSelect={(coords) => handleLocationSelect(selectedField, coords)}
                        defaultLocation={logData[`${selectedField}_coords`]}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenMapDialog(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </form>
        }
        </>
    );
}

export default LogForm;