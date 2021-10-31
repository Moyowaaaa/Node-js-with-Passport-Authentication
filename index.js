const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { ensureAuthenticated } = require('./config/auth');

const app = express();


//passport
require('./config/passport')(passport)
//User model 
const User = require('./models/User')

//Ejs
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');


//bodyparser

app.use(express.urlencoded({ extended: false }));



//express sessions
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

  //connect flash
  app.use(flash());


  //global variables
  app.use((req,res,next) => {
      res.locals.success_msg = req.flash('success_msg');
      res.locals.error_msg = req.flash('error_msg');
      res.locals.error = req.flash('error');
      next();
  })

//database

const db = require('./config/keys').MongoURI

//connect


mongoose.connect(db)
    .then(err => console.log('Connceted.....'))
    .catch(err => console.log(err));


//routes


app.get('/', (req, res) => {
    res.render('welcome')
})

app.get('/dashboard', ensureAuthenticated, (req,res) =>{
    res.render('dashboard', {
        name: req.user.name
    })
})





//users
//login page
app.get('/login', (req, res) => {
    res.render('login')
})


//regsister

app.get('/register', (req, res) => {
    res.render('register')
})

//register handle

app.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
  
    if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Please enter all fields' });
    }
  
    if (password != password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
  
    if (password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
    }
  
    if (errors.length > 0) {
      res.render('register', {
        errors,
        name,
        email,
        password,
        password2
      });
    } else {
      User.findOne({ email: email }).then(user => {
        if (user) {
          errors.push({ msg: 'Email already exists' });
          res.render('register', {
            errors,
            name,
            email,
            password,
            password2
          });
        } else {
          const newUser = new User({
            name,
            email,
            password
          });
  
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  req.flash(
                    'success_msg',
                    'You are now registered and can log in'
                  );
                  res.redirect('/users/login');
                })
                .catch(err => console.log(err));
            });
          });
        }
      });
    }
  });

//login 
app.post('/login',(req,res,next) => {
    passport.authenticate('local',{
        successRedirect: '/dashboard',
        failureRedirect:'/login',
        failureFlash: true
    })(req,res,next)
})
//log out 
app.get('/logout', (Req,res) => {
    req.logout();
    req.flash('Success_msg', 'Logged out')
    res.redirect('/login')
})



const PORT = process.env.PORT || 4100

app.listen(PORT, () => console.log(`May the force be with you on port ${PORT}`))