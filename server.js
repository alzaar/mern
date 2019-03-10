const express = require('express');
const app = express();
const mongoose = require('mongoose');
const DB = require('./config/keys').MONGO_URI;
const user = require('./api/user');
const profile = require('./api/profile');
const post = require('./api/post');
const bodyParser = require('body-parser');
const passport = require('passport');
//Middleware Setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//passport Middleware
app.use(passport.initialize());
//passport config
require('./config/passport')(passport);
//Setup Mongoose && Connection
// mongoose.promise = global.promise;
mongoose
.connect(DB, { useNewUrlParser: true })
.then(() => console.log('Connected to Mongo'))
.catch(err => console.log(err));

const PORT = process.env.PORT || 5000;


//Setup ROUTES
app.get('/', function(req, res) {
  res.send('Hello World');
});

app.use('/api/profile', profile);
app.use('/api/users', user);
app.use('/api/post', post);

app.listen(PORT, () => console.log(`Listening at ${PORT}`));

// var childProcess = require('child_process');
// childProcess.exec('open -a "Google Chrome" http://localhost:5000', err => {if (err) console.log(err)});
