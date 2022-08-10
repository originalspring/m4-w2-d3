const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const auth = require('http-auth');
const bcrypt = require('bcrypt');
const {
  check,
  validationResult
} = require('express-validator');

const router = express.Router();
const Registration = mongoose.model('Registration');
const basic = auth.basic({
  file: path.join(__dirname, '../users.htpasswd'),
});

router.get('/', (req, res) => {
  //res.send('It works!');
  res.render('index', {
    title: 'Registration form'
  });
});

router.get('/register', (req, res) => {
  //res.send('It works!');
  res.render('register', {
    title: 'Registration form'
  });
});

router.get('/registrations', basic.check((req, res) => {
  Registration.find()
    .then((registrations) => {
      res.render('registrants', {
        title: 'Listing registrations',
        registrations
      });
    })
    .catch(() => {
      res.send('Sorry! Something went wrong.');
    });
}));

router.post('/',
  [
    check('name')
    .isLength({
      min: 1
    })
    .withMessage('Please enter a name'),
    check('email')
    .isLength({
      min: 1
    })
    .withMessage('Please enter an email'),
    check('user')
    .isLength({
      min: 1
    })
    .withMessage('Please enter a username'),
    check('pwd')
    .isLength({
      min: 1
    })
    .withMessage('Please enter a password')
  ],


  //add hoemwork
  async (req, res) => {
    //console.log(req.body);
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      const registration = new Registration(req.body);
      const salt = await bcrypt.genSalt(10);
      registration.pwd = await bcrypt.hash(registration.pwd, salt);
      registration.save()
        .then(() => {
          res.render('thankyou')
        })
        .catch((err) => {
          console.log(err);
          res.send('Sorry! Something went wrong.');
        });
    } else {
      res.render('register', {
        title: 'Registration form',
        errors: errors.array(),
        data: req.body,
      });
    }
  });

module.exports = router;