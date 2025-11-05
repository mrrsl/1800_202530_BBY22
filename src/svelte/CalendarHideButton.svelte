<script>
    import { onMount } from "svelte";
    let {
        parentClickFunc,
        collapsed = false,
    } = $props();
    
    let isCollapsed = $state(collapsed);

    function handleClick() {
        isCollapsed = !isCollapsed;
        parentClickFunc();
        
        let arrow = document.querySelector("#btn-img");

        if (isCollapsed) {
            arrow.style.transform = "rotate(180deg)";
        } else {
            arrow.style.transform = "rotate(0deg)";
        }
    }

    onMount(() => {
        let arrow = document.querySelector("#btn-img");
        if (isCollapsed) {
            arrow.style.transform = "rotate(180deg)";
        } else {
            arrow.style.transform = "rotate(0deg)";
        }
    })
</script>

<style>
button {
    width: 100%;
    height: 20px;
    background-color: transparent;
    border: none;

    display: flex;
    justify-content: center;
}

#btn-img {
    transition: transform 0.3s ease;
}
</style>

<button onclick={handleClick}>
    <img id="btn-img" src="/images/icons/uparrow.png" alt="hide calendar"/>
</button>