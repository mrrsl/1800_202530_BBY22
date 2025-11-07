<script>
    const {
        userName
    } = $props();
</script>
<style>
    /* Declare mobile styles first, 700px @media later*/
    #super-wrapper {
        display: flex;
        flex-direction: row;
        height: 200px;
        margin: 5px;
    }
    #navIcons {
        display: flex;
        height: 100%;
        max-height: 100%;
    }
    #planner-name {
        display: flex;
        flex-grow: 2;
        align-items: center;
    }
    #planner-name > h1 {
        text-align: center;
        width: 100%;
        font-size: 25pt;
    }
    #backarrow {
        width: 8vw;
        max-width: 70px;
        height: auto;
        aspect-ratio: 1/1;
    }
    a.icon {
        padding: 4px;
        aspect-ratio: 1/1;
        width: auto;
    }
    a.icon > img {
        max-height: 100%;
        display: block;
        object-fit: contain;
    }
    @media (max-width: 599px) {
        #super-wrapper {
            max-height: 85px;
        }
        #navIcons {
            flex-direction: column;
        }
        a.icon {
            height: 50%;
        }
    }
    @media (min-width: 600px) {
        #planner-name > h1 {
            font-size: 30pt;
        }
        #navIcons {
            flex-direction: row;
            max-width: 100px;
        }
        a.icon {
            height: 100%;
        }
    }
</style>
<div id="super-wrapper">

    <button
        id="backarrow"
        onclick={window.history.back}
        aria-label="back">
        <img src="/images/icons/up-arrow.png" alt="backarrow" />
    </button>
    <div id="planner-name">
        <h1>Spencer's Planner</h1>
    </div>
    <div id="navIcons">
        <a href="settings.html" class="icon">
            <img src="/images/icons/settingsgear.png" alt="settings gear"/>
        </a>
        <a href="#" class="icon">
            <img src="/images/calendaricon.png" alt="calendar" />
        </a>
    </div>
</div>
