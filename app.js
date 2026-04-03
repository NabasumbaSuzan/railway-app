require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.send("OK");
});

// ✅ Connect to PostgreSQL (Railway)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false,
});

// ✅ Check DB connection at startup
pool.connect()
  .then(() => console.log("✅ Connected to database"))
  .catch(err => console.error("❌ DB Connection Error:", err.message));

const PORT = process.env.PORT || 3000;


// ✅ Home route (READ)
app.get("/", async (req, res) => {
  try {
    console.log("Route / hit");

    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY id DESC"
    );

    console.log("Tasks fetched:", result.rows.length);

    let taskList = result.rows
      .map(
        (t) =>
          `<li>${t.title} 
            <a href="/delete/${t.id}">Delete</a>
          </li>`
      )
      .join("");

    res.send(`
        <h1>Task Manager</h1>
        <form method="POST" action="/add">
            <input name="task" placeholder="Enter task" required/>
            <button>Add</button>
        </form>
        <ul>${taskList}</ul>
    `);

  } catch (err) {
    console.error("🚨 Home Error:", err.message);
    res.status(500).send("Error loading tasks: " + err.message);
  }
});


// ✅ Add task (CREATE)
app.post("/add", async (req, res) => {
  try {
    const { task } = req.body;

    if (!task) {
      return res.send("Task cannot be empty");
    }

    console.log("Task added:", task);

    await pool.query(
      "INSERT INTO tasks (title) VALUES ($1)",
      [task]
    );

    res.redirect("/");
  } catch (err) {
    console.error("🚨 Add Error:", err.message);
    res.status(500).send("Error adding task: " + err.message);
  }
});


// ✅ Delete task (DELETE)
app.get("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Deleting task with ID:", id);

    await pool.query(
      "DELETE FROM tasks WHERE id = $1",
      [id]
    );

    res.redirect("/");
  } catch (err) {
    console.error("🚨 Delete Error:", err.message);
    res.status(500).send("Error deleting task: " + err.message);
  }
});


// ✅ Start server
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
  console.log("New deployment test");
});