import dayjs from 'dayjs';

// Convert HH:mm string to dayjs object
export const timeStringToDayjs = (timeString) => {
    if (!timeString) return null; // Handle empty string cases
    const [hours, minutes] = timeString.split(':').map(Number);
    return dayjs().hour(hours).minute(minutes).second(0);
};

// Convert dayjs object to HH:mm string
export const dayjsToTimeString = (dayjsObject) => {
    if (!dayjsObject) return ''; // Handle null cases
    return dayjsObject.format('HH:mm');
};

export const validateEndTime = (endTime, startTime) => {
    return endTime > startTime || endTime === "00:00";
};