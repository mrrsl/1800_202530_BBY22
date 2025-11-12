<script>
    import { onMount, onDestroy } from "svelte";
    
    import TodoTask from "./TodoTask.svelte";

    // Import from Database.js (adjust path if needed)
    import { addPersonalTask, subscribeToPersonalTasksForDate, togglePersonalTaskCompletion, removePersonalTask } from "../js/Database.js";

    /**
     * Component properties.
     * @property {Array} todaysList Collection of objects with title, description and completed fields keyed by a unique task ID.
     * @property {Function<void>} addTaskPreAction Function called at the beginning of the addTask asction.
     * @property {Function<void>} addTaskPostAction Function called at the end of the addTask action.
     */
    const {
        todaysList = [],
        renderFinishedInit = false,
        date = new Date(),
        addTaskPreAction = () => {},
        addTaskPostAction = () => {}
    } = $props();

    /**
     * Tasks to render.
     */
    let taskList = $state(todaysList);
    let unsubscribe;  // For real-time listener cleanup

    onMount(() => {
        // Subscribe to real-time updates for today's tasks
        unsubscribe = subscribeToPersonalTasksForDate(date, (tasks) => {
            taskList = tasks.map(task => ({
                ...task,
                completed: task.completed ?? false  // Default to false if not set
            }));
        }, (error) => {
            console.error("Error subscribing to tasks:", error);
        });
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
    });

    /**
     * Generates handlers for toggling completion status of a task.
     * @param {String} id Firestore document ID.
     */
    function toggleCompletionFactory(id) {
        return async function() {
            const task = taskList.find(t => t.id === id);
            if (task) {
                const newCompleted = !task.completed;
                togglePersonalTaskCompletion(date, id, newCompleted, () => {
                    // Update local state for immediate feedback
                    taskList = taskList.map(t => t.id === id ? { ...t, completed: newCompleted } : t);
                }, (error) => {
                    console.error("Error toggling completion:", error);
                });
            }
        }
    }

    /**
     * Generates handlers for removing a task.
     * @param {String} id Firestore document ID.
     */
    function removeFactory(id) {
        return async function() {
            removePersonalTask(date, id, () => {
                // Update local state for immediate feedback
                taskList = taskList.filter(t => t.id !== id);
            }, (error) => {
                console.error("Error removing task:", error);
            });
        }
    }

    /**
     * Event listener on text input.
     * @param {KeyboardEvent} event
     */
    async function inputListener(event) {
        if (event.key === "Enter") {
            let textInput = event.target;
            let taskBody = textInput.value.trim();
            if (taskBody) {
                addTaskPreAction();
                const newTask = {
                    date: date,  // Pass Date object; addPersonalTask will convert to string
                    title: taskBody,
                    desc: "",  // 'desc' instead of 'description' to match Database.js
                    completed: false
                };
                addPersonalTask(newTask, (docRef) => {
                    // Success: real-time listener will add to taskList
                    addTaskPostAction();
                }, (error) => {
                    console.error("Error adding task:", error);
                    addTaskPostAction();  // Call post-action even on error if desired
                });
                textInput.value = "";
            }
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
    margin-top: 10px;
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
    <input id="taskInput" type="text" placeholder="Add new task..." onkeydown={inputListener} />
    <ul id="taskList">
        {#each taskList as task (task.id)}
            <TodoTask
                title={task.title}
                description={task.desc}
                completed={task.completed}
                taskId={task.id}
                completeHandler={toggleCompletionFactory(task.id)}
                removeHandler={removeFactory(task.id)}
                />
        {/each}
    </ul>
</div>