const { db } = require('../util/admin');
const { getQuote } = require('../util/helpers')

module.exports = {
  performance: async (req, res) =>{
    const userRef = db.doc(`/users/${req.user.username}`);
    const pRef = userRef.collection('performance');
    const hRef = userRef.collection('holdings');
  
    const hRes = await hRef.get()
      .catch((err) => res.status(500).json({error: err.code}))
    let totalVal = 0;
    if(!hRes.empty){
      for(let i = 0; i < hRes.size; i++){
        const quote = await getQuote(hRes.docs[i].data().symbol)
          .catch((error) => res.status.json(error))
        totalVal = totalVal + (hRes.docs[i].data().numShares * quote.price);
      }
    }
    const userDoc = await userRef.get()
      .catch((err) => res.status(500).json({error: err.code}))
    
    totalVal = totalVal + userDoc.data().cash
    let performance = {
      endingValue: totalVal,
      date: new Date().toISOString()
    }
  
    await pRef.add(performance)
      .then(() => res.status(200).json({message: "Recorded end of day value"}))
      .catch((err) => res.status(500).json({error: err.code}))
  }
}