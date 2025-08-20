// Frontend logic for tasks with backend (Express + SQLite) persistence
const form = document.getElementById("todoForm");
const taskName = document.getElementById("taskName");
const taskDuration = document.getElementById("taskDuration");
const taskStart = document.getElementById("taskStart");
const taskTable = document.getElementById("taskTable");

const totalCount = document.getElementById("totalCount");
const totalDuration = document.getElementById("totalDuration");
const nextTask = document.getElementById("nextTask");

let tasks = [];

// Load tasks from backend on page load
(async function loadTasks() {
  try {
    const res = await fetch("/api/tasks");
    if (!res.ok) throw new Error("Erreur de chargement");
    tasks = await res.json();
    renderTable();
    updateStats();
  } catch (e) {
    console.error(e);
    alert(
      "Impossible de charger les tâches. Assurez-vous que le serveur est démarré (npm start)."
    );
  }
})();

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = taskName.value.trim();
  const duration = parseInt(taskDuration.value, 10);
  const start = taskStart.value;

  if (!name || isNaN(duration) || !start) {
    alert("Remplis tous les champs correctement !");
    return;
  }

  try {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, duration, start }),
    });
    if (!res.ok) throw new Error("Erreur d'enregistrement");
    const created = await res.json();

    // Update local list with DB id
    tasks.push(created);

    taskName.value = "";
    taskDuration.value = "";
    taskStart.value = "";

    renderTable();
    updateStats();
  } catch (e) {
    console.error(e);
    alert("Impossible d'ajouter la tâche.");
  }
});

function renderTable() {
  taskTable.innerHTML = "";
  tasks.forEach((task) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                <td>${task.name}</td>
                <td>${task.duration}</td>
                <td>${task.start}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 i-del">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                </td>
      `;
    taskTable.appendChild(row);
  });
}

async function deleteTask(id) {
  try {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erreur de suppression");
    const result = await res.json();
    if (result.deleted) {
      tasks = tasks.filter((t) => t.id !== id);
      renderTable();
      updateStats();
    }
  } catch (e) {
    console.error(e);
    alert("Impossible de supprimer la tâche.");
  }
}

function updateStats() {
  totalCount.textContent = tasks.length;
  totalDuration.textContent = tasks.reduce(
    (sum, t) => sum + Number(t.duration || 0),
    0
  );

  if (tasks.length > 0) {
    const next = tasks.reduce((earliest, t) => {
      return !earliest || t.start < earliest.start ? t : earliest;
    }, null);
    nextTask.textContent = `${next.name} (${next.start})`;
  } else {
    nextTask.textContent = "—";
  }
}
