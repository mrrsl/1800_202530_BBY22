<script>
    import {
        getMonthGrid,
        getMonthName,
        getWeekSpan,
        getWeekRow,
    } from '../js/DateUtils.js';

    import { onMount } from 'svelte';

    import CalendarHideButton from './CalendarHideButton.svelte';
    import TodoList from "./TodoList.svelte";

    /**
     * Component properties.
     * @property {Date} displayedDateInit Array of numbers representing a month grid.
     * @property {Number} selectedDateInit Selected date on the calendar.
     * @property {String} accentColor CSS-compatible color string for calendar day backgrounds.
     * @property {Boolean} initCollapse Whether the calendar should be initially collapsed.
     */
    const {
        displayedDateInit,
        accentColor,
        initCollapse = true,
        bodyFont = "Oooh Baby",
        headingFont = "Inria Serif"
    } = $props();

    /** 
     * Whether the main calendar is currently collapsed.
     * Special note: the calendar will be initially rendered in a expanded state so intialize to false first.
     * */
    let collapseState = $state(false);

    /**
     * Date currently selected.
     */
    let currentDate = $state(displayedDateInit);

    /**
     * Currently selected day cell, used to remove styling.
     */
    let currentDateElement = null;
    /**
     * Component state
     */
    let monthView = $state(getMonthGrid(displayedDateInit.getMonth()));

    /**
     * Shorter function declutter HTML
     * @param num Value within monthView array.
     */
    function determineDayFade(num) {
        if (num < 0) return "off-month";
        else return "on-month";
    }

    /**
     * Utility to remove verbose array accesses.
     */
    let monthIterator = {
        indexState: 0,
        yieldMonth: function() {
            if (this.indexState >= monthView.length) {
                this.indexState = 0;
            }
            return monthView[this.indexState++];
        },
        peek: function() {
            return monthView[this.indexState];
        }
    }

    /**
     * Collapse/Expands rows within the month table except for current week.
     */
    function collapseExpand() {
        let weekIndex = getWeekRow(monthView, displayedDateInit.getDate());
        let weekRows = document.querySelectorAll("table#month-table > tbody > tr");

        weekRows.forEach((row, index) => {
            if (index !== weekIndex) {
                if (row.style.display === "none") {
                    row.style.display = "flex";
                } else {
                    row.style.display = "none";
                }
            }
        });

        collapseState = !collapseState;
    }

    /** 
     * Generates individual event handlers for clicking the day cells in the month table.
     * @param {Number} date 
     */
    function generateDayHandler(date) {
        if (date > 0) {

            return function(event) {
                currentDate.setDate(date);
                event.target.classList.add("selected");
                if (currentDateElement)
                    currentDateElement.classList.remove("selected");
                currentDateElement = event.target;
            }

        } else {
            if (date > -7) {

                return function(event) {
                    currentDate.setDate(1);
                    currentDate.setMonth(currentDate.getMonth() + 1);
                    currentDate.setDate(Math.abs(date));
                    monthView = getMonthGrid(currentDate.getMonth(), currentDate.getFullYear());
                }

            } else {

                return function(event) {
                    currentDate.setDate(1);
                    currentDate.setMonth(currentDate.getMonth() - 1);
                    currentDate.setDate(Math.abs(date));
                    monthView = getMonthGrid(currentDate.getMonth(), currentDate.getFullYear());
                }
                
            }
        }
    }

    /**
     * Sets the intial direction of the arrow on the collapse/expand button.
     */
    onMount(() => {
        if (initCollapse) {
            collapseExpand();
            collapseState = true;
        }
        if (currentDateElement == null) {
            currentDateElement == document.querySelector("td.selected");
        }
    });

</script>

<style>
@import 'tailwindcss';
div#calendar-superelement {
    width: 100%;
    height: fit-content;
    max-width: 450px;
}
#month-name {
    font-size: 20pt;
}

div#weeks {
    box-shadow: 0 0 20px rgba(78, 22, 45, 0.3);
    padding: 5px;
    margin-bottom: 5px;
}
div#weeks > div {
    width: 13%;
    text-align: center;
    font-family: inherit;
}

table#month-table {
    border-collapse: collapse;
}
tr {
    display: flex;
    flex-direction: row;
}
td {
    width: 100%;
    height: auto;
    aspect-ratio: 1/1;
    padding: 3px;
    color: #222222;
}
td.off-month {
    color: #AAAAAA;
    filter: opacity(0.45);
}
div.calendar-day {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;

    border-radius: 20px;
    box-shadow: 0 0 30px rgba(78, 22, 45, 0.2);
    
}
div.calendar-day > p {
    text-align: center;

}

@media (min-width: 600px) {
    div.calendar-day > p {
        font-size: 30px;
    }
}
</style>

<div id="calendar-superelement">
    <div id="calendar-container" class="p-2">
        <div id="month-name" class="py-1 text-center text-xl font-bold" style="font-family: {bodyFont}">
            {getMonthName(displayedDateInit.getMonth())}
        </div>
        <div id = "weeks" class="w-full flex flex-row justify-between"
            style="font-family: {headingFont}; background-color: {accentColor}">
            <div>
                Sun
            </div>
            <div>
                Mon
            </div>
            <div>
                Tues
            </div>
            <div>
                Wed
            </div>
            <div>
                Thurs
            </div>
            <div>
                Fri
            </div>
            <div>
                Sat
            </div>
        </div>
        <!--
        Building up the month calendar by row.
        -->
        <table id="month-table" class="container">
            <tbody>
                {#each {length: getWeekSpan(monthView)} as _, a}
                    <tr>
                        {#each {length: 7} as _, b}
                            <td class="{determineDayFade(monthIterator.peek())}"
                                onclick={generateDayHandler(monthIterator.peek())}>

                                <div class="calendar-day" style="background-color: {accentColor}">
                                    <p>{Math.abs(monthIterator.yieldMonth())}</p>
                                </div>

                            </td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <CalendarHideButton parentClickFunc={collapseExpand} collapsed={initCollapse}/>
</div>
<TodoList date={displayedDateInit} />