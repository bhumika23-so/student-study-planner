// Student Study Planner - script.js

// State: list of tasks stored in memory and persisted via localStorage
let tasks = [];

// DOM Element References
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const prioritySelect = document.getElementById("priority-select");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const pendingCountEl = document.getElementById("pending-count");
const completedCountEl = document.getElementById("completed-count");
const totalCountEl = document.getElementById("total-count");

// Initialize application on page load
window.addEventListener("DOMContentLoaded", () => {
  loadTasksFromStorage();
  render();
});

// Load tasks from LocalStorage
function loadTasksFromStorage() {
  try {
    const saved = localStorage.getItem("study_planner_tasks");
    if (saved) {
      tasks = JSON.parse(saved);
    }
  } catch (error) {
    console.error("Could not load tasks from storage:", error);
    tasks = [];
  }
}

// Save tasks to LocalStorage
function saveTasksToStorage() {
  try {
    localStorage.setItem("study_planner_tasks", JSON.stringify(tasks));
  } catch (error) {
    console.error("Could not save tasks to storage:", error);
  }
}

// Handle Form Submission (Add Task)
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = taskInput.value.trim();
  const priority = prioritySelect.value;

  if (!title) {
    return;
  }

  // Create new task object
  const newTask = {
    id: Date.now().toString(),
    title: title,
    priority: priority, // 'High', 'Medium', or 'Low'
    completed: false
  };

  // Add to front of task list
  tasks.unshift(newTask);

  // Save and re-render UI
  saveTasksToStorage();
  render();

  // Reset input and keep focus
  taskInput.value = "";
  taskInput.focus();
});

// Toggle task completion status
function toggleTaskCompletion(taskId) {
  tasks = tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  saveTasksToStorage();
  render();
}

// Delete task
function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasksToStorage();
  render();
}

// Update task counts (Pending, Completed, Total)
function updateCounters() {
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  pendingCountEl.textContent = pendingCount;
  completedCountEl.textContent = completedCount;
  totalCountEl.textContent = totalCount;
}

// Render task list and counters
function render() {
  // Update the stats numbers
  updateCounters();

  // Clear existing list items
  taskList.innerHTML = "";

  // Show or hide empty state message
  if (tasks.length === 0) {
    emptyState.classList.add("visible");
  } else {
    emptyState.classList.remove("visible");

    // Build DOM elements for each task
    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = `task-item ${task.completed ? "completed" : ""}`;

      // Content wrapper
      const contentDiv = document.createElement("div");
      contentDiv.className = "task-content";

      // Task Title
      const titleSpan = document.createElement("span");
      titleSpan.className = "task-title";
      titleSpan.textContent = task.title;

      // Priority Badge
      const badgeSpan = document.createElement("span");
      badgeSpan.className = `priority-badge priority-${task.priority.toLowerCase()}`;
      badgeSpan.textContent = `${task.priority} Priority`;

      contentDiv.appendChild(titleSpan);
      contentDiv.appendChild(badgeSpan);

      // Actions wrapper
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "task-actions";

      // Complete / Undo Button
      const completeBtn = document.createElement("button");
      completeBtn.type = "button";
      completeBtn.className = "btn btn-complete";
      completeBtn.textContent = task.completed ? "Completed ✓" : "Complete";
      completeBtn.title = task.completed ? "Mark as pending" : "Mark as completed";
      completeBtn.addEventListener("click", () => toggleTaskCompletion(task.id));

      // Delete Button
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn btn-delete";
      deleteBtn.textContent = "Delete";
      deleteBtn.title = "Delete this task";
      deleteBtn.addEventListener("click", () => deleteTask(task.id));

      actionsDiv.appendChild(completeBtn);
      actionsDiv.appendChild(deleteBtn);

      // Append content and actions to list item
      li.appendChild(contentDiv);
      li.appendChild(actionsDiv);

      taskList.appendChild(li);
    });
  }
}
