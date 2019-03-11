const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');
const validateRegisterInput = require('../../validations/register');
const validateLoginInput = require('../../validations/login');
//Load User model
const User = require('../../models/user');

// @route testing for user
// /api/user/test
//@get request with public access
router.get('/test', (req, res) => res.status(200).json({msg: 'this is user'}));


// @route Get /api/user/register
// @desc Register User
//@access public
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  //Check validations
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email })
  .then(user => {
    if (user) {
      return res.status(400).json({ email: 'Email already exists' });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: 20, //size
        r: 'pg', //rating
        d: 'mm' //default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;

          newUser.save()
          .then((user) => {
            res.json(user)
          })
          .catch(err => console.log(err));
        })
      })
    }
  })
})
// @route Get /api/user/login
// @desc Login User
//@access public
router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  //Check validations
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  let password = req.body.password;
  User.findOne({email})
  .then(user => {
    //Check User
    if (!user) {
      res.status(404).json({email: 'User not found'})
    }
    //Check password
    bcrypt.compare(password, user.password)
    .then(isMatch => {
      if (isMatch) {
        //User Match
        //Generating jsonwebtoken
        //Need Payload
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.name
        };

        jwt.sign(payload, keys.keyOrSecret, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: 'Bearer ' + token
          })
        });


      } else {
        res.status(404).json({password: 'Incorrect password'});
      }
    })
  })
  .catch(err => console.log(err))
})

// @route Get /api/user/current
// @desc Return current User
//@access private

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    name: req.user.name,
    email: req.user.email,
    id: req.user.id
  });
})


module.exports = router;
