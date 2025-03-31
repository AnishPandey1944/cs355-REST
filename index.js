const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const usersFilePath = path.join(__dirname, 'users.json');

const readUsers = () => {
    if (!fs.existsSync(usersFilePath)) return [];
    return JSON.parse(fs.readFileSync(usersFilePath));
};

const writeUsers = (users) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

app.post('/users', async (req, res) => {
    let users = readUsers();
    const { username, password } = req.body;
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    writeUsers(users);
    res.status(201).json({ message: 'User created' });
});

app.get('/users', (req, res) => {
    let users = readUsers();
    res.json(users);
});

app.get('/users/:username', (req, res) => {
    let users = readUsers();
    const user = users.find(u => u.username === req.params.username);
    user ? res.json(user) : res.status(404).json({ error: 'User not found' });
});

app.patch('/users/:username', async (req, res) => {
    let users = readUsers();
    const userIndex = users.findIndex(u => u.username === req.params.username);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
    if (req.body.password) {
        users[userIndex].password = await bcrypt.hash(req.body.password, 10);
    }
    writeUsers(users);
    res.json({ message: 'User updated' });
});

app.delete('/users/:username', (req, res) => {
    let users = readUsers();
    users = users.filter(u => u.username !== req.params.username);
    writeUsers(users);
    res.json({ message: 'User deleted' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
