export function extractTimeFromDate(isoDate) {
    const date = new Date(isoDate);
    // Extract hours, minutes, and seconds
    const hours = date.getHours().toString().padStart(2, '0'); // Ensure two digits
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    // Construct the time string in the format HH:MM:SS
    const timeString = `${hours}:${minutes}:${seconds}`;

    return timeString;
}

export function diffInTime(oldTime, currentTime) {

    const oldTimeObj = new Date(oldTime);
    const currentTimeObj = new Date(currentTime);
    // Calculate the difference in milliseconds between old time and current time
    const timeDifference = currentTimeObj.getTime() - oldTimeObj.getTime();

    // Convert milliseconds to minutes
    const timeDifferenceInMinutes = timeDifference / (1000 * 60);

    // Check if the difference is greater than 10 minutes
    return timeDifferenceInMinutes > 10;
}