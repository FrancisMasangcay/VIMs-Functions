const {db} = require('../util/admin');

//set tutotial value to true
module.exports= (req, res) => {
  db.doc(`/users/${req.user.username}`)
    .update({hasDoneTutorial: true})
    .then(() => {
      return res.status(200).json({msg: "successfuly updated hasDoneTutorial"});
    })
    .catch((err) => {
      return res.status(500).json({msg: err.message});
    })
}