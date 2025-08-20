// Minimal Express server to serve static files and tasks API
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./Config/db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve public directory
app.use(express.static(path.join(__dirname, "..", "public")));

// Tasks API
app.get("/api/tasks", (req, res) => {
  db.all(
    "SELECT id, name, duration, start FROM tasks ORDER BY date(start) ASC",
    [],
    (err, rows) => {
      if (err)
        return res
          .status(500)
          .json({ error: "DB_READ_ERROR", details: err.message });
      res.json(rows);
    }
  );
});

app.post("/api/tasks", (req, res) => {
  const { name, duration, start } = req.body || {};
  if (!name || typeof duration !== "number" || !start) {
    return res.status(400).json({ error: "INVALID_PAYLOAD" });
  }
  const stmt = db.prepare(
    "INSERT INTO tasks (name, duration, start) VALUES (?, ?, ?)"
  );
  stmt.run([name.trim(), duration, start], function (err) {
    if (err)
      return res
        .status(500)
        .json({ error: "DB_WRITE_ERROR", details: err.message });
    res
      .status(201)
      .json({ id: this.lastID, name: name.trim(), duration, start });
  });
});

app.delete("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id))
    return res.status(400).json({ error: "INVALID_ID" });
  const stmt = db.prepare("DELETE FROM tasks WHERE id = ?");
  stmt.run([id], function (err) {
    if (err)
      return res
        .status(500)
        .json({ error: "DB_DELETE_ERROR", details: err.message });
    res.json({ deleted: this.changes > 0 });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

fetch("https://mon-backend.render.com/taches");
