require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Connect to Railway PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const PORT = process.env.PORT || 3000;


// ✅ Home route (READ from database)
// ✅ Home route (READ from database with error handling)
app.get("/", async (req, res) => {
  try {
    console.log("Route / hit");

    const result = await pool.query("SELECT * FROM tasks ORDER BY id DESC");

    console.log("Tasks fetched:", result.rows.length);

    let taskList = result.rows
      .map(
        (t) =>
          `<li>${t.title} <a href="/delete/${t.id}">Delete</a></li>`
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
    console.error("🚨 REAL ERROR:", err.message);

    res.status(500).send(`
      <h1>Something broke</h1>
      <p>${err.message}</p>
    `);
  }
});

// ✅ Add task (INSERT into database)
app.post("/add", async (req, res) => {
  const { task } = req.body;

  console.log("Task added:", task);

  await pool.query(
    "INSERT INTO tasks (title) VALUES ($1)",
    [task]
  );

  res.redirect("/");
});


// ✅ Delete task (DELETE from database)
app.get("/delete/:id", async (req, res) => {
  const { id } = req.params;

  console.log("Deleting task with ID:", id);

  await pool.query(
    "DELETE FROM tasks WHERE id = $1",
    [id]
  );

  res.redirect("/");
});




app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("New deployment test");
});