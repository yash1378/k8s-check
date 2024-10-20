const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

// Create an instance of express
const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection configuration
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase';

// Middleware for parsing JSON bodies
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Serve the index.html when the user accesses the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Define a User schema using Mongoose
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
});

// Create a User model
const User = mongoose.model('User', userSchema);

// Connect to MongoDB
async function connectToMongo() {
    try {
        await mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

// GET route to fetch all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.json(users); // Return the users as JSON
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Error fetching users');
    }
});

// POST route to create a new user
app.post('/users', async (req, res) => {
    const { name, age } = req.body;
    if (name && age) {
        try {
            const newUser = new User({ name, age });
            await newUser.save(); // Save the new user to the database
            res.send(`User ${newUser.name}, aged ${newUser.age}, has been created with ID ${newUser._id}.`);
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).send('Error creating user');
        }
    } else {
        res.status(400).send('Missing name or age in the request body.');
    }
});

// PUT route to update a user
app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, age } = req.body;
    try {
        const result = await User.findByIdAndUpdate(id, { name, age }, { new: true }); // Update the user
        if (result) {
            res.send(`User with ID ${id} has been updated.`);
        } else {
            res.status(404).send(`User with ID ${id} not found.`);
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Error updating user');
    }
});

// DELETE route to delete a user
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await User.findByIdAndDelete(id); // Delete the user
        if (result) {
            res.send(`User with ID ${id} has been deleted.`);
        } else {
            res.status(404).send(`User with ID ${id} not found.`);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Error deleting user');
    }
});

// Error handling for non-existent routes
app.use((req, res, next) => {
    res.status(404).send('Route not found.');
});

// Start the server and connect to MongoDB
app.listen(port, async () => {
    console.log(`App running on http://localhost:${port}`);
    await connectToMongo(); // Connect to MongoDB
});
