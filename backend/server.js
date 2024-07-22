const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
const session = require('express-session');
const userRoutes = require('./routes/users');
const authenticateUser = require('./middleware/authenticateUser');


app.use(session({
  secret: 'Avdqead34@#43@#$', 
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 60 * 1000 } ,
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(cors({
  origin: 'http://localhost:3000',  
  credentials: true  
}));

// Mount auth and user routes
app.use('/', authRoutes);  
app.use(authenticateUser);
app.use('/', userRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
