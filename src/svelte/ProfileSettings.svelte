<script>
    const {
        bodyFont = "Inria Serif, serif",
        placeholderEmail = "boatfan@buoyswillbebouys.com",
        placeholderName = "Lil' Yachty"
    } = $props();
</script>

<style>
    @import "tailwindcss";

    .profilesectiontitle-wrapper {
        display: flex;
        align-items: flex-start;
        width: fit-content;
        height: fit-content;
        border: 2px solid #cecece81;
        border-radius: 20px;
        background-color: rgba(255, 255, 255, 0.774);
        margin: 3px 0px;
        padding: 4px 8px;
    }
    #profilesectiontitle {
        text-align: left;
        font-size: 16pt;
        font-weight: bold;
        margin: 0;
    }
    .profilebox {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        padding: 2vw;
        width: 100%;
        box-shadow: 0 4px 15px rgba(78, 22, 45, 0.568);
        display: flex;
        flex-direction: column;
        text-align: left;
        max-width: 500px;
        border: 1px solid #4a2b30;
        border-radius: 16px;
        background-color: #fffdfc;
    }
    #settingstitle {
        font-size: 20px;
    }
    /* styles the input boxes within the profile box */
    .profilebox input[type="text"] {
        padding: 7px;
        width: 100%;
        border: 1.5px solid #b57268;
        border-radius: 8px;
        font-size: 20px;
        font-family: inherit;
    }

      /* styles the logout button */
    #logoutbutton {
        border: none;
        border-radius: 14px;
        font-size: 14pt;
        text-align: left;
        cursor: pointer;;

        width: fit-content;
        padding: 8px 14px;

        background-color: #a58a91;
        color: white;
    }
</style>

<div class="profilesectiontitle-wrapper">
    <p id="profilesectiontitle" style="font-family: {bodyFont}">PROFILE</p>
</div>
<div class="profilebox" style="font-family: {bodyFont}">
    <p id="settingstitle" class="mt-2">Edit Name:</p>
    <input type="text" placeholder="{placeholderName}" class="mt-0.5" />

    <p id="settingstitle" class="mt-2">Edit Email:</p>
    <input type="text" placeholder="{placeholderEmail}" class="mt-0.5"/>

    <button id="logoutbutton" style="font-family: {bodyFont}" class="mt-3">Log Out</button>
</div>
<div id="spacer" class="mb-4"></div>