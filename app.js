const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


let tasks = [];

// Home route
app.get('/', (req, res) => {
    let taskList = tasks.map((t, i) => `<li>${t} <a href="/delete/${i}">Delete</a></li>`).join('');
    res.send(`
        <h1>Task Manager</h1>
        <form method="POST" action="/add">
            <input name="task" placeholder="Enter task" required/>
            <button>Add</button>
        </form>
        <ul>${taskList}</ul>
    `);
});

// Add task
app.post('/add', (req, res) => {
    tasks.push(req.body.task);
    res.redirect('/');
});

// Delete task
app.get('/delete/:id', (req, res) => {
    tasks.splice(req.params.id, 1);
    res.redirect('/');
});


app.listen(3000, () => console.log('Server running on http://localhost:3000'));