const normalizeDate = (dateInput) => {
    if (!dateInput) {
        console.log('Date input is null or undefined');
        return null;
    }

    try {
        // If input is already a Date object, return it with time set to noon UTC
        if (dateInput instanceof Date) {
            const normalizedDate = new Date(Date.UTC(
                dateInput.getFullYear(),
                dateInput.getMonth(),
                dateInput.getDate(),
                12, 0, 0
            ));
            return normalizedDate;
        }

        // If input is a string, try different formats
        const dateStr = dateInput.toString().trim();

        // Try DD-MM-YYYY format first
        const dateParts = dateStr.split('-');
        if (dateParts.length === 3) {
            const [day, month, year] = dateParts.map(num => parseInt(num, 10));
            const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

            if (!isNaN(date.getTime())) {
                return date;
            }
        }

        // Try parsing as a regular date string
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
            return new Date(Date.UTC(
                parsedDate.getFullYear(),
                parsedDate.getMonth(),
                parsedDate.getDate(),
                12, 0, 0
            ));
        }

        console.log(`Unable to parse date: ${dateStr}`);
        return null;
    } catch (error) {
        console.log(`Error normalizing date ${dateInput}:`, error);
        return null;
    }
};

module.exports = { normalizeDate };