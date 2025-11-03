<script>
    import { onMount } from "svelte";
    
    import TodoTask from "./TodoTask.svelte";
    /**
     * Component properties.
     * @property {Array} todaysList - Array of objects with title, description and completed fields.
     * @property {Function} addTaskPreAction - Function called at the beginning of the addTask asction.
     * @property {Function} addTaskPostAction - Function called at the end of the addTask action.
     */
    let {
        todaysList = [],
        addTaskPreAction = () => {},
        addTaskPostAction = () => {}

    } = $props();

</script>

<style>
.todo-container {
    background-image: url("/images/gridbackground.png");
    background-repeat: repeat-y; /* repeats vertically */
    background-size: cover;
    background-position: top center;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgb(130, 98, 98);
    padding: 2rem;
    position: relative;
    z-index: 1;
    min-height: 1000px; /* gives the grid background a long canvas feel */
}
    /* styles the task list container that holds all the tasks */
#taskList {
    max-width: 500px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
    font-size: 40pt;
}
input[type="text"] {
    font-family: "Oooh Baby", sans-serif;
    font-size: 40pt;
    padding: 10px;
    border: 2px solid #3615299b;
    border-radius: 12px;
    background-color: #f9f9f9;
    width: 100%;
    max-width: 80rem;
    margin-bottom: 12px;
    transition: all 0.2s ease;
}
/* css for the placeholder text in the input box */
input[type="text"]::placeholder {
    font-family: "Oooh Baby", sans-serif;
    font-size: 40pt;
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
        {#each todaysList as task}
            <TodoTask title={task.title} description={task.description} completed={task.completed}/>
        {/each}
    </ul>
</div>