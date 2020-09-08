const express = require('express');
const connectDB = require('./config/db')

const app = express();


//Connect database

connectDB();

//Initial Middleware

app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

//Defining routes

app.use('/v1', require('./routes/api/users'))
app.use('/v1', require('./routes/api/auth'))
app.use('//profile', require('./routes/api/profile'))

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on ${PORT}`))
