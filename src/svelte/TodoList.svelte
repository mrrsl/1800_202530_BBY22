<script>    
    import TodoTask from "./TodoTask.svelte";
    import { authInit, isAuthenticated } from "../js/Authentication.js";
    import {
        addPersonalTask,
        getPersonalTasks,
        removeTask
    } from "./../js/Database.js";

    import { onMount } from "svelte";

    /**
     * Component properties.
     * @property {Array} todaysList Collection of objects with title, description and completed fields keyed by a unique task ID.
     * @property {Function<void>} addTaskPreAction Function called at the beginning of the addTask asction.
     * @property {Function<void>} addTaskPostAction Function called at the end of the addTask action.
     */
    const {
        /** Tells component which day's tasks to retrieve. */
        dateProp = new Date()
    } = $props();
    /**
     * Tasks to render.
     */
    let taskList = $state([]);

    /** Quick and dirty method for giving unique ids to the task objects. */
    let taskRenderId = 0;
    /**
     * Generates handlers for toggling completion status of a task.
     * @param {ClickEvent} event Identifier correlating to its document location in Firestore.
     */
    function toggleCompletion(id) { 
        let removedTask = taskList[0];
        let removedIndex = 1;
        while (removedIndex < taskList.length) {
            if (taskList[removedIndex].id == id) {

                removedTask = taskList.splice(removedIndex, 1)[0];
                removedIndex = taskList.length + 1;
            }
        }
        removeTask(removedTask.date, removedTask.docId, () => {
            getPersonalTasks(dateProp, updateTaskList);
        });
    }

    /**
     * Event listener on text input.
     * @param {KeyboardEvent} event
     */
    async function inputListener(event) {
        if (event.key == "Enter") {
            let textInput = document.querySelector("#taskInput");
            let taskBody = textInput.value.trim();
            // Format specifies a date string
            let time = new Date();
            time.setFullYear(dateProp.getFullYear());
            time.setMonth(dateProp.getMonth());
            time.setDate(dateProp.getDate());

            let taskObj = {
                date: time,
                title: "",
                desc: taskBody,
                completed: false,
                id: taskRenderId++
            };

            addPersonalTask(taskObj,
                doc => {
                    taskList.push(taskObj);
                    textInput.value = "";
                }
            );

        }
    }
    /**
     * Replaces the {@link taskList} state with a newly fetched task array.
     * @param fetchedTasks
     */
    function updateTaskList(fetchedTasks) {
        console.log("Fetched the day's tasks:", fetchedTasks);
        if (fetchedTasks.length == 0) {
            taskList = [];
            return;
        }
        taskList = fetchedTasks.map(tObj => {
            tObj.id = taskRenderId++;
            return tObj;
        });
    }

    // Need to make sure currentUser is populated before we start loading data
    function loadData() {
        authInit(function() {
            getPersonalTasks(dateProp, updateTaskList);
        });
    }
    onMount(loadData);

    // Apparently just having state as a prop doesn't guaruntee the component re-renders
    $effect(() => {
        if (dateProp && isAuthenticated()) {
            getPersonalTasks(dateProp,updateTaskList);
        }
    });

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
    max-width: 700px;
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
    <input id="taskInput" type="text" placeholder="Add new task..." onkeydown={inputListener}/>
    <ul id="taskList">
        {#each taskList as taskItem}
                <TodoTask
                    title={taskItem.title}
                    desc={taskItem.desc}
                    completed={taskItem.completed}
                    taskId={taskItem.id}
                    removeHandler={toggleCompletion}/>
        {/each}
    </ul>
</div>