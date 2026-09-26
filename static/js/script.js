const API_URL = "/api/tasks/";

let tasks = [];
let currentFilter = "all";


document.addEventListener("DOMContentLoaded", () => {

    loadTasks();


    document
        .getElementById("task-form")
        .addEventListener("submit", saveTask);


    document
        .getElementById("cancel-btn")
        .addEventListener("click", resetForm);


    document
        .getElementById("search")
        .addEventListener("input", displayTasks);


    document
        .querySelectorAll(".filter-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                document
                    .querySelectorAll(".filter-btn")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );


                button.classList.add("active");


                currentFilter =
                    button.dataset.filter;


                displayTasks();

            });

        });

});


async function loadTasks() {

    try {

        const response =
            await fetch(API_URL);


        if (!response.ok) {

            throw new Error(
                "Unable to load tasks."
            );

        }


        tasks = await response.json();


        displayTasks();

    } catch (error) {

        showError(error.message);

    }

}


async function saveTask(event) {

    event.preventDefault();

    clearError();


    const title =
        document
            .getElementById("title")
            .value
            .trim();


    const description =
        document
            .getElementById("description")
            .value
            .trim();


    const priority =
        document.getElementById("priority").value;


    const dueDate =
        document.getElementById("due-date").value;


    const taskId =
        document.getElementById("task-id").value;


    if (title.length < 3) {

        showError(
            "Task title must contain at least 3 characters."
        );

        return;

    }


    const taskData = {

        title: title,

        description: description,

        priority: priority,

        due_date: dueDate || null

    };


    try {

        let response;


        if (taskId) {

            const existingTask =
                tasks.find(
                    task => task.id == taskId
                );


            taskData.completed =
                existingTask
                    ? existingTask.completed
                    : false;


            response = await fetch(
                `${API_URL}${taskId}/`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(taskData)
                }
            );


        } else {

            response = await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(taskData)
                }
            );

        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.title
                    ? data.title[0]
                    : "Unable to save task."
            );

        }


        resetForm();


        await loadTasks();


    } catch (error) {

        showError(error.message);

    }

}


function displayTasks() {

    const container =
        document.getElementById(
            "task-container"
        );


    const searchText =
        document
            .getElementById("search")
            .value
            .toLowerCase()
            .trim();


    let filteredTasks =
        tasks.filter(task => {

            const matchesSearch =
                task.title
                    .toLowerCase()
                    .includes(searchText)

                ||

                task.description
                    .toLowerCase()
                    .includes(searchText);


            let matchesFilter = true;


            if (currentFilter === "pending") {

                matchesFilter =
                    !task.completed;

            }


            if (currentFilter === "completed") {

                matchesFilter =
                    task.completed;

            }


            return (
                matchesSearch &&
                matchesFilter
            );

        });


    if (filteredTasks.length === 0) {

        container.innerHTML =
            `<p class="empty">
                No tasks found.
            </p>`;

        return;

    }


    container.innerHTML =
        filteredTasks
            .map(task => createTaskHTML(task))
            .join("");

}


function createTaskHTML(task) {

    const completedClass =
        task.completed
            ? "completed"
            : "";


    const priorityClass =
        task.priority.toLowerCase();


    return `

        <div class="task-card ${completedClass}">

            <h3>
                ${escapeHTML(task.title)}
            </h3>

            <p>
                ${escapeHTML(
                    task.description ||
                    "No description"
                )}
            </p>


            <div class="task-meta">

                <span class="badge ${priorityClass}">
                    Priority: ${task.priority}
                </span>


                <span class="badge">
                    Due:
                    ${task.due_date ||
                    "No due date"}
                </span>


                <span class="badge">
                    Status:
                    ${task.completed
                        ? "Completed"
                        : "Pending"}
                </span>

            </div>


            <div class="task-actions">

                <button
                    class="action-btn complete-btn"
                    onclick="toggleComplete(${task.id})">

                    ${task.completed
                        ? "Mark Pending"
                        : "Complete"}

                </button>


                <button
                    class="action-btn edit-btn"
                    onclick="editTask(${task.id})">

                    Edit

                </button>


                <button
                    class="action-btn delete-btn"
                    onclick="deleteTask(${task.id})">

                    Delete

                </button>

            </div>

        </div>

    `;

}


async function toggleComplete(id) {

    const task =
        tasks.find(
            task => task.id === id
        );


    if (!task) return;


    try {

        const response =
            await fetch(
                `${API_URL}${id}/`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        completed:
                            !task.completed
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to update task."
            );

        }


        await loadTasks();


    } catch (error) {

        showError(error.message);

    }

}


function editTask(id) {

    const task =
        tasks.find(
            task => task.id === id
        );


    if (!task) return;


    document.getElementById("task-id").value =
        task.id;


    document.getElementById("title").value =
        task.title;


    document.getElementById("description").value =
        task.description || "";


    document.getElementById("priority").value =
        task.priority;


    document.getElementById("due-date").value =
        task.due_date || "";


    document.getElementById("form-title").innerText =
        "Update Task";


    document.querySelector(
        "#task-form .primary"
    ).innerText =
        "Update Task";


    document.getElementById("cancel-btn")
        .style.display =
        "inline-block";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


async function deleteTask(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmed) return;


    try {

        const response =
            await fetch(
                `${API_URL}${id}/`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to delete task."
            );

        }


        await loadTasks();


    } catch (error) {

        showError(error.message);

    }

}


function resetForm() {

    document
        .getElementById("task-form")
        .reset();


    document.getElementById("task-id").value =
        "";


    document.getElementById("form-title").innerText =
        "Add New Task";


    document.querySelector(
        "#task-form .primary"
    ).innerText =
        "Add Task";


    document.getElementById("cancel-btn")
        .style.display =
        "none";


    clearError();

}


function showError(message) {

    document.getElementById(
        "error-message"
    ).innerText = message;

}


function clearError() {

    document.getElementById(
        "error-message"
    ).innerText = "";

}


function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent = text;


    return div.innerHTML;

}