// utils/normDates.js

/**
 * Normalizes a Date object to the start of the day (midnight UTC).
 * This ensures consistency when comparing dates without time components.
 *
 * @param {Date|string} date - The date to normalize.
 * @returns {Date} - The normalized Date object.
 */
const normalizeDate = (date) => {
    const normalized = new Date(date);
    normalized.setUTCHours(0, 0, 0, 0);
    return normalized;
};

module.exports = {
    normalizeDate
};
