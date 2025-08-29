require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const commentsRoutes = require('./routes/comments');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGODB_STRING);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB Atlas.");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

if(require.main === module){
    app.listen(process.env.PORT || 3000, () => {
        console.log(`API is now online on port ${ process.env.PORT || 3000 }`)
    });
}
// [SECTION] Export for Boodle testing

module.exports = { app, mongoose };
