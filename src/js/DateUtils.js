'use-strict'
/**
 * Utility functions to ease getting date and time for the calendar bar.
*/

const dayNames = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];


/**
 * Utility to determine if a given year is a leap year.
 * @param {Number} year year as returned by Date.getFullYear.
 * @returns {boolean} True if year has 366 days.
 */
export const isLeapYear = function(year)
{
    return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}

/**
 * Returns the number of days in a given month for the current year.
 * @param {Number} monthNum Number as returned by Date.getMonth.
 * @returns {Number} Value between [0 - 31]
 */
export const numDays = function(monthNum) {
    const numDaysMap = [
        31,
        (isLeapYear(new Date(Date.now()).getFullYear)) ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31     
    ];
    
    // These functions let the caller do something like 0 - 1 in the argument
    if (Math.abs(monthNum) > 11) monthNum %= 12
    if (monthNum < 0) monthNum = 11 + monthNum;

    return numDaysMap[monthNum];
}

/**
 * Returns a week object that associates a day in the current week with the days of the current month.
 * @returns {Object}
 */
export const getCurrentWeek = function() {
    let today = new Date(Date.now());
    
    let sundayDate = today.getDate() - today.getDay();
    let weekDates = [ 0, 0, 0, 0, 0, 0, 0 ];

    if (sundayDate < 0) {
        let prevMonthDays = numDays(today.getMonth() - 1);
        weekDates[0] = prevMonthDays - sundayDate + 1;
    } else {
        weekDates[0] = sundayDate;
    }

    let currentMonthDays = numDays(today.getMonth());
    for (let a = 1; a < weekDates.length; a++) {
        weekDates[a] = weekDates[a - 1] + 1;
        if (weekDates[a] > currentMonthDays) {
            weekDates[a] = 1;
        }
    }

    return {
        month: monthNames[today.getMonth()],
        week: weekDates
    };
}

/**
 * Generates an array of week-aligned days for a given month and year. Defaults to current date if no month/year given.
 * @param {Number?} month Value returned by Date.getMonth()
 * @param {Number?} year Value returned by Date.getFullYear()
 * @return {Array} An array of length 42 where index-0 is on a Saturday and 41 is on a Sunday. Elements < 0 indicate days on different months.
 */
export const getMonthGrid = function(month, year) {
    let dateGrid = new Array(42);

    let first = new Date(Date.now());
    first.setDate(1);
    
    // Check optional args
    if (month)
        first.setMonth(month);
    if (year)
        first.setFullYear(year);

    for(let a = 0; a < first.getDay(); a++) {
        dateGrid[a] = -1;
    }

    for(let a = 0; a < numDays(month); a++) {
        dateGrid[first.getDay() + a] = a + 1;
    }

    return dateGrid;
}