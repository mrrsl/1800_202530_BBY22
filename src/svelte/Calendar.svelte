<script>
    import {
        getMonthGrid,
        numDays,
        getMonthName,
        getWeekSpan
    } from '../js/DateUtils.js';

    /**
     * Component properties
     */
    let {
        displayedMonth
    } = $props();

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

</script>

<style>
@import 'tailwindcss';
div#calendar-superelement {
    width: 100vw;
    height: 300px;
}
/* Encloses the date grid. */
div#calendar-container {
    mask-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 1) 0%,
        rgba(0, 0, 0, 1) 80%,
        rgba(0, 0, 0, 0) 100%
    )
}

table#month-table {
    border-collapse: collapse;
}
table#month-table td {
    border-style: solid;
    border-width: 1px;
    border-color: #efefef;
}
tr {
    display: flex;
    flex-direction: row;
}
td {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
    height: auto;
    aspect-ratio: 1/1;
    padding: 4px;
}
td.on-month {
    color: #222222;
}
td.off-month {
    color: #dddddd;
}
div.calendar-day {
    width: auto;
    text-align: right;
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
                                <div class="calendar-day">
                                    {Math.abs(monthIterator.yield())}
                                </div>
                            </td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <div id="expand-container">

    </div>
</div>