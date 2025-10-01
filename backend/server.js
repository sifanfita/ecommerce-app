import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';

// App Config
const app = express(); // Initialize Express app(instance of express server)
const port = process.env.PORT || 9000; // Define the port
connectDB()

// Middlewares
app.use(express.json()); // Middleware to parse JSON bodies(requests will be passed using json)
app.use(cors()); // Middleware to enable CORS (Cross-Origin Resource Sharing or we can access the backend from any IP address)

// api endpoints
app.get('/', (req, res) => {
    res.send("API is running...");
})

// Start the server
app.listen(port, () => console.log(`Listening on localhost:${port}`));
