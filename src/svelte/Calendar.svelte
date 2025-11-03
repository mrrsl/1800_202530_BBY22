<script>
    import {
        getMonthGrid,
        getMonthName,
        getWeekSpan,
        getWeekRow,
    } from '../js/DateUtils.js';

    import { onMount } from 'svelte';

    import CalendarHideButton from './CalendarHideButton.svelte';

    /**
     * Component properties
     */
    let {
        displayedMonth,
        accentColor,
        initCollapse = true
    } = $props();
    
    /** Special note: the calendar will be initially rendered in a expanded state so intialize to false first.*/
    let collapseState = $state(false);
    /**
     * Component state
     */
    let monthView = getMonthGrid(displayedMonth);
    let weekSpan = getWeekSpan(monthView);
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
        yield: function() {
            if (this.indexState >= monthView.length) {
                this.indexState = 0;
            }
            return monthView[this.indexState++];
        },
        peek: function() {
            return monthView[this.indexState];
        }
    }

    function collapseExpand() {
        let weekIndex = getWeekRow(displayedMonth, new Date().getDate());
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

    onMount(() => {
        if (initCollapse) {
            collapseExpand();
            collapseState = true;
        }
    });

</script>

<style>
@import 'tailwindcss';
div#calendar-superelement {
    width: 100%;
    height: 300px;
    max-width: 450px;
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

    border-radius: 5px;
    
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
        <div id="month-name" class="py-1 text-center text-xl font-serif font-bold">
            {getMonthName(displayedMonth)}
        </div>
        <!--
        Building up the month calendar by row.
        -->
        <table id="month-table" class="container">
            <tbody>
                {#each {length: weekSpan} as _, a}
                    <tr>
                        {#each {length: 7} as _, b}
                            <td class="{determineDayFade(monthIterator.peek())}">
                                <div class="calendar-day" style="background-color: {accentColor}">
                                    <p>{Math.abs(monthIterator.yield())}</p>
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