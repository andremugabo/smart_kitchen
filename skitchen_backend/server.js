const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');



dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;


const setupSwagger = require('./swagger');


app.use(express.json());


// Enable CORS for your frontend
app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true, 
}));


app.use('/uploads', express.static(path.join(__dirname,'uploads')));




setupSwagger(app)


// Health check
app.get('/', (req,res)=>{
    res.send('Smart Kitchen Backend is Healthy !! 💥')
});

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));