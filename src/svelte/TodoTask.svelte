<script>
    import { onMount } from "svelte";
    /**
     * Component properties.
     * @property {String} title Task title.
     * @property {String} description Task description.
     * @property {Boolean} completed Whether to mark task as completed.
     */
    const {
        title,
        desc,
        completed,
        taskId,
        removeHandler = () => {},
        completeHandler = () => {}
    } = $props();

    let completeState = $state(completed);
    /** Reference for the text block in Task Component. */
    let taskText;
    /** Reference for description block of the text. */
    let liElement;
    
    function removeTask() {
        removeHandler(taskId);
        document.querySelector("li").remove()
    }

    function toggleCompletion() {
        completeHandler()
        let liElement = document.querySelector("li");
        if (completeState) {
            liElement.classList.remove("done");
            completeState = false;
        } else {
            liElement.classList.add("done");
            completeState = true;
        }
    }


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

        font-family: inherit;
    }
    div#task-text > p {
        font-size: 14pt;
    }
    li.done {
        text-decoration: line-through;
        color: #b5b5b5;
        background: #f2f2f2;
        opacity: 0.7;
    }

    button {
        font-size: 14pt;
        height: 15pt;
    }
</style>

<li bind:this={liElement}>
    <div id="task-text" role="status" bind:this={taskText}>
        <h4> {title} </h4>
        <p>{desc}</p>
    </div>
    <button id="remove-button" aria-label="remove task button" onclick={removeTask}>
        X
    </button>
</li>

