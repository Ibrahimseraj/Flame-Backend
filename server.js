const express = require("express");
const xss = require("xss-clean");
const rateLimiting = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require('hpp');
const cors = require('cors');
require("dotenv").config();
const connectionToDB = require("./config/db");
const bodyParser = require('body-parser');



//connection to database
connectionToDB();

//init app
const app = express();


app.use(express.json());
app.use(helmet());
app.use(hpp());
app.use(xss());
app.use(rateLimiting({
  windowMs: 10 * 60 * 1000,
  max: 1000
}));
app.use(cors());


//routes
app.use('/auth', require("./Routes/auth"));
app.use('/profile', require("./Routes/user"));
app.use('/post', require("./Routes/post"));
app.use('/comment', require("./Routes/comment"));
app.use('/password', require("./Routes/password"));

//running server
const PORT = process.env.PORT || 2000;

app.listen(PORT, () => {
  console.log(`running sucssfully on port ${PORT}`);
});