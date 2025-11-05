<script>
    const {
        collRef,
        bodyFont = "Inria Serif, serif"
    } = $props();
</script>

<style>
    @import "tailwindcss";

    #profilesectiontitle {
        text-align: left;
        font-size: 16pt;
        font-weight: bold;
        margin: 0;
    }

    /* styles the profile box with the name and email */
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

      /* styles the headings within the profile box: Edit Name:, Edit Email:  */
    #settingstitle {
        font-weight: bold;
        font-size: 16pt;
        color: #4a2b30;
    }

      /* styles the container for the APPEARANCE title */
    .appearancesectiontitle-wrapper {
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
    /* styles the container for the color wheel; mostly creates the border and spacing */
    .colorpickerwheel {
        display: flex;
        flex-direction: row;
        padding: 8px;
        border: 1px solid #b5b5b5;
        border-radius: 12px;
        background-color: rgba(255, 255, 255, 0.8);
        width: 50%;
        height: fit-content;
        max-width: 300px;
        font-family: inherit;
    }

      /* styles the actual color input itself */
    .colorpickerwheel [type="color"] {
        width: 100%;
        height: 30px;
        border: none;
        cursor: pointer;
        padding: 0;
        background: none;
    }

      /* styles the default accent color button */
    #restoreColor {
        width: 45%;
        font-family: inherit;
        color: white;
        background-color: #a58a91;
        padding: 8px 16px;
        color: #ffffff;
        border: 1.5px solid #b5b5b5;
        border-radius: 20px;
        font-size: 12pt;
    }

    .fontsection {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 40px;
    }
      /* styles the font icon beside the Font section with the 3 buttons */
    .fontsection img {
        padding: 5px;
        width: 40px;
        height: auto;
        aspect-ratio: 1/1;
    }

      /* styles all three font buttons at once */
    .font-button {
        width: 66px;
        line-height: 1;
        margin-left: 8px;
        border: 1px solid #ccc;
        border-radius: 6px;
        background-color: #f5f5f5;
        cursor: pointer;
        padding: 0px 3px;
        font-size: 14pt;
    }

      /* styles the container holding the three buttons to align them in the same row */
    .font-button-group {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }


    
    #fontOptionOne {
        font-family: "Cormorant Garamond", sans-serif;
    }

    #fontOptionTwo {
        font-family: "Quicksand Book", sans-serif;
    }

    #fontOptionThree {
        font-family: "Oooh Baby", sans-serif;
    }
</style>


<div class="appearancesectiontitle-wrapper mt-6">
    <p id="profilesectiontitle" style="font-family: {bodyFont}">APPEARANCE</p>
</div>

<div class="profilebox" style="font-family: {bodyFont}">
    <p id="settingstitle" class="w-full">Choose Accent Color:</p>
    <div class="accentcolorsection flex flex-row w-full items-center">
        <div class="colorpickerwheel">
            <input
                type="color"
                id="accentColor"
                name="accentColor"
                value="#b57268"/>
        </div>
        <button id="restoreColor" class="ml-2">Default Color</button>
    </div>
    <div class="m-2"></div>
    <div class="font-button-group">
        <div class="fontsection">
            <img src="/images/icons/texticon.png" alt="font button"/>
            <p id="settingstitle">
                 Font:
            </p>
        </div>
        <button class="font-button" id="fontOptionOne">Fancy</button>
        <button class="font-button" id="fontOptionTwo">Mono</button>
        <button class="font-button" id="fontOptionThree">Default</button>
    </div>
</div>