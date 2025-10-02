'use-strict'
/*
Task holds state information for individual tasks. Page scripts will describe how to render the information
*/
class Task {
    /* Use a Date object here. */
    deadline;
    /* User provided description of what the task is. */
    body;

    constructor(argsObj) {
        if (argsObj) {

            if (argsObj.getFullYear)
                this.deadline = argsObj.deadline;
            else
                this.deadline = new Date(Date.now());
            this.body = argsObj.body;

        } else {

            this.deadline = new Date(Date.now());

        }
    }
}