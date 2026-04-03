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
app.get("/", async (req, res) => {
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
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY id DESC");

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
    console.error("REAL ERROR:", err.message);
    res.send("Error: " + err.message);
  }
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("New deployment test");
});