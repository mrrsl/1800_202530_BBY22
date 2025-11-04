<script>
    import { onMount } from "svelte";
    
    import TodoTask from "./TodoTask.svelte";
    /**
     * Component properties.
     * @property {Array} todaysList Collection of objects with title, description and completed fields keyed by a unique task ID.
     * @property {Function<void>} addTaskPreAction Function called at the beginning of the addTask asction.
     * @property {Function<void>} addTaskPostAction Function called at the end of the addTask action.
     */
    const {
        todaysList = [],
        renderFinishedInit = false,
        date = new Date()
    } = $props();

    /**
     * Tasks to render.
     */
    let taskList = $state(todaysList);

    /**
     * Generates handlers for toggling completion status of a task.
     * @param {Number} id Identifier correlating to its document location in Firestore.
     */
    function toggleCompletionFactory(id) {
        return function() {
            // TODO
        }
    }

    /**
     * Event listener on text input.
     * @param {KeyboardEvent} event
     */
    async function inputListener(event) {
        let textInput = document.querySelector("#taskInput");
        if (event.key == "Enter") {
            let taskBody = textInput.value.trim();
            // TODO
        }
    }

</script>

<style>
.todo-container {
    background-image: url("/images/backgrounds/gridbackground.png");
    background-repeat: repeat-y; /* repeats vertically */
    background-size: 100% auto;
    background-position: top center;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgb(130, 98, 98);
    padding: 2rem;
    min-height: 1000px; /* gives the grid background a long canvas feel */
}
    /* styles the task list container that holds all the tasks */
#taskList {
    max-width: 500px;
    margin: 0 auto;
    font-size: 40pt;
}
input[type="text"] {
    font-family: "Oooh Baby", sans-serif;
    padding: 10px;
    border: 2px solid #3615299b;
    border-radius: 12px;
    background-color: #f9f9f9;
    width: 100%;
    max-width: 600px;
    margin-bottom: 12px;
    transition: all 0.2s ease;
}
/* css for the placeholder text in the input box */
input[type="text"]::placeholder {
    font-family: "Oooh Baby", sans-serif;
    color: #807777;
    opacity: 0.7;
}
ul {
    list-style: none;
    padding: 0px;
}
</style>

<div class="todo-container">
    <input id="taskInput" type="text" placeholder="Add new task..." />
    <ul id="taskList">
        {#each taskList as task(task.id)}
            <TodoTask
                title={task.title}
                description={task.description}
                completed={task.completed}
                taskId={task.id}
                completeHandler={toggleCompletionFactory(task.id)}/>
        {/each}
    </ul>
</div>