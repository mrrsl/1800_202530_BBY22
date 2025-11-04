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
        completed = false,
        taskId = null,
        removeHandler = () => {},
        completeHandler = () => {}
    } = $props();

    let completeState = $state(completed);

    function taskSort(ta, tb) {

    }

    function removeTask() {
        removeHandler();
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

    onMount(() => {
        let taskText = document.querySelector("#task-text");
        taskText.addEventListener("click", toggleCompletion);
    });

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
    li.done {
        text-decoration: line-through;
        color: #b5b5b5;
        background: #f2f2f2;
        opacity: 0.7;
    }
</style>

<li>
    <div id="task-text">
        <h4> {title} </h4>
        <p>{description}</p>
    </div>
    <button id="remove-button" aria-label="remove task button" onclick={removeTask}>
        X
    </button>
</li>

