const { db } = require('../util/admin');
const { isEmail, isEmpty} = require('../util/helpers');

const config = require('../util/config');
const firebase = require('firebase');
firebase.initializeApp(config);

exports.signUp = (req, res) => {
  let token;
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPass: req.body.confirmPass,
    first: req.body.first,
    last: req.body.last,
    username: req.body.username
  }

  let errors = {}; //js object to hold any errors we get

  //checks field entries
  if(isEmpty(newUser.password) && isEmpty(newUser.confirmPass)) 
    errors.password = "Must not be empty";

  if(isEmpty(newUser.first))
    errors.first = "Must not be empty";

  if(isEmpty(newUser.last))
    errors.last = "Must not be empty";

  if(isEmpty(newUser.username))
    errors.username = "Must not be empty";

  if(isEmpty(newUser.email))
    errors.email = "Must not be empty";
  else if(!isEmail(newUser.email)) errors.email = "Must be a valid email";
  
  //checks if passwords match
  if(newUser.password != newUser.confirmPass)
    errors.password = "passwords must match";

  //checks if there were any errors and outputs them
  if(Object.keys(errors).length > 0)
    return res.status(400).json({errors}); 

  db.doc(`/users/${newUser.username}`).get()
    .then((doc) => {
      //checks if username is taken
      if (doc.exists){
        return res.status(400).json({username: "this username is already taken"});
      }
      else{
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then((data) => {
      //stores userID from creating the account with fire auth
      userID = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      //object that will be passed up to firestore as a new document
      const userCredentials ={
        first: newUser.first,
        last: newUser.last,
        email: newUser.email,
        username: newUser.username,
        userID,
        cash: 100000,
        allocation: {
          stock: 0,
          cash: 100
        }
      };
      
      //creates the new doc in firebase
      return db.doc(`/users/${newUser.username}`).set(userCredentials); 
    })
    .then(() => {
      return res.status(201).json({token}); //returns token for accessing private features
    })
    .catch((err) => {
      if(err.code === "auth/email-already-in-use"){
        return res.status(400).json({error: "email is already in use"});
      }
      return res.status(500).json({ error: err.code});
    })
}

exports.login = (req, res) => {
  let user = {
    email: req.body.email,
    password: req.body.password
  };

  errors = {};

  if(isEmpty(user.password)) errors.password = "Must not be empty";
  if(isEmpty(user.email)) errors.email = "Must not be empty";
  if(!isEmail(user.email)) errors.email = "Please enter a valid email address";

  if(Object.keys(errors).length > 0)
    return res.status(400).json({errors}); 

  //signing in with firebase
  firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({token});
    })
    .catch((err) => {
      if(err.code === "auth/wrong-password"){
        res.status(403).json({ general: "Invalid credentails, please try again"});
      } else return res.status(500).json({ error: err.code});
      console.error(err);
    })
  }