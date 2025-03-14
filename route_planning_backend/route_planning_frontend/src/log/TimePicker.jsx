import { TextField, Typography } from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import React, { useState } from 'react';
import { timeStringToDayjs, dayjsToTimeString } from './utils'; // Import conversion functions

function MuiTimePicker15Minutes({ value, onChange,disabled, label }) {
    const handleTimeChange = (newValue) => {
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
                label={label}
                value={value}
                onChange={handleTimeChange}
                minutesStep={15}
                disabled={disabled}
                renderInput={(params) => <TextField {...params} />}
            />
        </LocalizationProvider>
    );
}


function TimePickerWithHHMM({timeString, setTimeString, disabled, label, validateTime}) {
    const [error, setError] = useState(false);
    const handleTimeChange = (dayjsObject) => {
        const newTimeString = dayjsToTimeString(dayjsObject);
        if (validateTime && !validateTime(newTimeString)) {
            setError(true);
        } else {
            setError(false);
            setTimeString(newTimeString);
            console.log('Selected Time:', newTimeString);
        }
    };

    return (
        <div>
            <MuiTimePicker15Minutes
                value={timeStringToDayjs(timeString)}
                onChange={handleTimeChange}
                disabled={disabled}
                label={label}
            />
            {error && <Typography color="error">Invalid time. end time {'>'} start time</Typography>}
        </div>
    );
}

export default TimePickerWithHHMM;