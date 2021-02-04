const { db } = require('../util/admin');
const { getQuote } = require('../util/helpers')

module.exports = {
  performance: async () =>{
    const users = await db.doc(`/users`).get();
    for(let i = 0; i < users.size; i++){
      const userRef = users[i];
      const pRef = userRef.collection('performance');
      const hRef = userRef.collection('holdings');
      const hRes = await hRef.get()
        .catch((err) => {console.log("error: ", err.code)})
      let totalVal = 0;
      if(!hRes.empty){
        for(let i = 0; i < hRes.size; i++){
          const quote = await getQuote(hRes.docs[i].data().symbol)
            .catch((error) => console.log("error: ", error))
          totalVal = totalVal + (hRes.docs[i].data().numShares * quote.price);
        }
      }
      
      const userDoc = await userRef.get()
      .catch((error) => console.log("error: ", error))
      
      totalVal = totalVal + userDoc.data().cash
      let performance = {
        endingValue: totalVal,
        date: new Date().toISOString()
      }
    
      await pRef.add(performance)
        .then(() => {
          console.log(`Recorded end of day value for ${userDoc.data().username}`)
        })
        .catch((error) => console.log("error: ", error.code))
    }
  }
}