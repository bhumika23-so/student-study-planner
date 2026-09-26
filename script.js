// Student Study Planner - script.js

// Storage key used for browser localStorage
const STORAGE_KEY = "student_study_planner_tasks";

// State: in-memory list of tasks
let tasks = [];

// DOM Element References
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const prioritySelect = document.getElementById("priority-select");
const searchInput = document.getElementById("search-input");
const priorityFilter = document.getElementById("priority-filter");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const noSearchResults = document.getElementById("no-search-results");
const pendingCountEl = document.getElementById("pending-count");
const completedCountEl = document.getElementById("completed-count");
const totalCountEl = document.getElementById("total-count");

/**
 * Load tasks from browser localStorage.
 * Automatically called when page is opened or refreshed.
 */
function loadTasksFromStorage() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      tasks = Array.isArray(parsed) ? parsed : [];
    } else {
      tasks = [];
    }
  } catch (error) {
    console.error("Error reading tasks from localStorage:", error);
    tasks = [];
  }
}

/**
 * Save current tasks to browser localStorage as a JSON string.
 */
function saveTasksToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving tasks to localStorage:", error);
  }
}

/**
 * Handle form submission to add a new task
 */
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

  // Prepend to tasks list
  tasks.unshift(newTask);

  // Clear search filter so newly added task is immediately visible
  if (searchInput.value) {
    searchInput.value = "";
  }

  // If active priority filter would hide this new task, reset to "All"
  if (priorityFilter && priorityFilter.value !== "All" && priorityFilter.value !== priority) {
    priorityFilter.value = "All";
  }

  // Persist to localStorage and re-render
  saveTasksToStorage();
  render();

  // Reset input field and retain focus
  taskInput.value = "";
  taskInput.focus();
});

/**
 * Handle Search Input - filters tasks dynamically as user types
 */
searchInput.addEventListener("input", () => {
  render();
});

/**
 * Handle Priority Filter - filters tasks by selected priority (All, High, Medium, Low)
 */
priorityFilter.addEventListener("change", () => {
  render();
});

/**
 * Toggle task completed status
 */
function toggleTaskCompletion(taskId) {
  tasks = tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  // Save changes to localStorage and re-render
  saveTasksToStorage();
  render();
}

/**
 * Delete a task by ID
 */
function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);

  // Save changes to localStorage and re-render
  saveTasksToStorage();
  render();
}

/**
 * Update pending, completed, and total counters
 */
function updateCounters() {
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  pendingCountEl.textContent = pendingCount;
  completedCountEl.textContent = completedCount;
  totalCountEl.textContent = totalCount;
}

/**
 * Render tasks to the DOM with combined search and priority filtering
 */
function render() {
  // Update stats counters based on total tasks
  updateCounters();

  // Clear task list
  taskList.innerHTML = "";

  // 1. If no tasks exist at all in the planner
  if (tasks.length === 0) {
    emptyState.classList.add("visible");
    noSearchResults.classList.remove("visible");
    return;
  }

  emptyState.classList.remove("visible");

  // 2. Get active search query and selected priority
  const query = searchInput.value.trim().toLowerCase();
  const selectedPriority = priorityFilter ? priorityFilter.value : "All";

  // Filter tasks by title AND priority without mutating the original tasks array
  const filteredTasks = tasks.filter((task) => {
    const matchesQuery = !query || task.title.toLowerCase().includes(query);
    const matchesPriority =
      selectedPriority === "All" || task.priority === selectedPriority;
    return matchesQuery && matchesPriority;
  });

  // 3. If tasks exist but none match search or priority criteria
  if (filteredTasks.length === 0) {
    noSearchResults.classList.add("visible");
    return;
  }

  noSearchResults.classList.remove("visible");

  // 4. Render matched tasks
  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;

    // Content container
    const contentDiv = document.createElement("div");
    contentDiv.className = "task-content";

    // Title
    const titleSpan = document.createElement("span");
    titleSpan.className = "task-title";
    titleSpan.textContent = task.title;

    // Priority badge
    const badgeSpan = document.createElement("span");
    badgeSpan.className = `priority-badge priority-${task.priority.toLowerCase()}`;
    badgeSpan.textContent = `${task.priority} Priority`;

    contentDiv.appendChild(titleSpan);
    contentDiv.appendChild(badgeSpan);

    // Actions container
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "task-actions";

    // Complete / Undo button
    const completeBtn = document.createElement("button");
    completeBtn.type = "button";
    completeBtn.className = "btn btn-complete";
    completeBtn.textContent = task.completed ? "Completed ✓" : "Complete";
    completeBtn.title = task.completed ? "Mark as pending" : "Mark as completed";
    completeBtn.addEventListener("click", () => toggleTaskCompletion(task.id));

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.title = "Delete this task";
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    actionsDiv.appendChild(completeBtn);
    actionsDiv.appendChild(deleteBtn);

    // Assemble and append list item
    li.appendChild(contentDiv);
    li.appendChild(actionsDiv);
    taskList.appendChild(li);
  });
}

/**
 * Initialize application:
 * Loads saved tasks from localStorage immediately and renders them.
 */
function init() {
  loadTasksFromStorage();
  render();
}

// Start app immediately or when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
