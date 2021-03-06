const { admin, db } = require('./admin');

module.exports = (req, res, next) => {
  let idToken;
  if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")){
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.log(req.headers.authorization);
    console.log(req.headers.authorization.startWith('Bearer'));
    return res.status(403).json({error: 'Unauthorized'});
  }

  admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      return db.collection('users')
        .where('userID', '==', req.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      req.user.username = data.docs[0].data().username;
      return next();
    })
    .catch((err) => {
      console.log(err)
      return res.status(403).json({error: 'error authenticating', errorMessage: err.message, errorName: err.name});
    })
}