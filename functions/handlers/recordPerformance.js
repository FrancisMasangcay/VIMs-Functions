const { db } = require('../util/admin');
const { getQuote } = require('../util/helpers')

module.exports = {
  performance: async (req, res) =>{
    const users = await db.collection('users').get();
    let errors = {};
    for(let i = 0; i < users.size; i++){
      const userRef = users.docs[i].ref;
      const pRef = userRef.collection('performance');
      const hRef = userRef.collection('holdings');
      const hRes = await hRef.get()
        .catch((err) => {errors.general = `${err.message}`})
      let totalVal = 0;
      if(!hRes.empty){
        for(let i = 0; i < hRes.size; i++){
          const quote = await getQuote(hRes.docs[i].data().symbol)
            .catch((err) => {errors.general = `${err.message}`})
          totalVal = totalVal + (hRes.docs[i].data().numShares * quote.price);
        }
      }
      
      const userDoc = await userRef.get()
      .catch((err) => {errors.general = `${err.message}`})
      
      totalVal = totalVal + userDoc.data().cash
      let performance = {
        endingValue: totalVal,
        date: new Date().toISOString()
      }
    
      await pRef.add(performance)
        .then(() => {
          console.log(`Recorded end of day value for ${userDoc.data().username}`)
        })
        .catch((err) => {errors.general = `${err.message}`})
    }
    if(Object.keys(errors).length > 0)
      return res.status(400).json(errors);
    else  
      return res.status(200).json({success: "Recorded all end of day performance values"})
  }
}