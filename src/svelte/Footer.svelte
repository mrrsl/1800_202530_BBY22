<script>
    const {
        accentColor = "#fff5fa",
        bodyFont = "Inria Serif"
    } = $props();
</script>

<style>
    .bottomnav {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100vw;
        height: 60px;
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
        z-index: 100;
        padding: 1vh;
    }

    .bottomnav ul {
        display: flex;
        justify-content: space-around;
        align-items: center;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .bottomnav li {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 14pt;
        color: #362830;
    }

    .bottomnav img {
        height: 25px;
        width: auto;
    }

</style>
<div class="bottomnav" style="background-color:{accentColor}">
    <ul>
        <li style="font-family:{bodyFont}">
            <a href="friends.html">
                <img src="/images/icons/friendsicon.png" alt="Friends" />
            </a>
            <span>Friends</span>
        </li>
        <li style="font-family:{bodyFont}">
            <a href="/src/html/home.html">
                <img src="/images/icons/scheduleicon.png" alt="Schedule"/>
            </a>
            <span>Schedule</span>
        </li>
    </ul>
</div>