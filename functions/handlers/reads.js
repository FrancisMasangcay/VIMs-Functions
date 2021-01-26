const {db} = require('../util/admin');

exports.getPerformance = (req, res) =>{
  db.doc(`/users/${req.user.username}`).collection('performance')
    .orderBy('date', 'desc')
    .limit(req.body.numRecords)
    .get()
    .then((data) =>{
      if(data.empty) 
        return res.status(204).json({response: "Performance records not found"})

      let response = [];
      for(let i = 0; i < data.size; i++){
        response.push(data.docs[i].data());
      }
      return res.status(200).json({performance: response});
    })
    .catch((err) => res.status(500).json({error: err.code}));
}

exports.getTransactions = (req, res) => {
  db.doc(`/users/${req.user.username}`).collection('transactions')
    .orderBy('date', 'desc')
    .limit(req.body.numRecords)
    .get()
    .then((data) => {
      if(data.empty)
        return res.status(204).json({response: "No transaction records found"})
      let records = [];
      for(let i = 0; i < data.size; i++){
        records.push(data.docs[i].data());
      }
      return res.status(200).json({transactions: records})
    })
    .catch((err) => res.status(500).json({error: err.code}))
}