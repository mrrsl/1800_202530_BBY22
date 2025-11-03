<script>
    import { onMount } from "svelte";
    /**
     * Component properties.
     * @property {String} title Task title.
     * @property {String} description Task description.
     * @property {Boolean} completed Whether to mark task as completed.
     */
    let {
        title = "Sample Task",
        description = "This is a sample task description.",
        completed = false
    } = $props();

</script>

<style>
    li {
        background: #fffdfcb5;
        margin-bottom: 10px;
        padding: 10px 14px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 1.5px solid rgb(74, 43, 48);
    }
</style>
<li>
    {#if title != "Sample Task"}
        <h4> {title} </h4>
    {/if}
    
</li>

