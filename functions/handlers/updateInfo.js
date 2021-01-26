const { db } = require('../util/admin');
const helpers = require('../util/helpers');

module.exports = {
  updateInfo: async (req, res) => {
    const userRef = db.doc(`/users/${req.user.username}`);
    const hRef = userRef.collection('holdings');
  
    //query firestore for current: allocation & cash from user collection,
    //and entire holdings collection
    const retrievalPromises = [userRef.get(), hRef.orderBy('symbol').get()];
    const snapshots = await Promise.all(retrievalPromises);
  
    //save the user document information: allocation & cash
    let alloc = snapshots[0].data().allocation;
    let cash = snapshots[0].data().cash; 
    let holdings = []; //save holdings into array of objects
  
    //check if there are documents in holdings
    if(!snapshots[1].empty){
      let documents = snapshots[1].docs;
      //push each holding into array
      for(let i = 0; i < snapshots[1].size; i++){
        let security = {};
        //gather the data and call yFinance API for current price
        security.symbol = documents[i].data().symbol;
        const quote = await helpers.getQuote(documents[i].data().symbol);
        security.price = quote.price;
        security.type = quote.type;
        security.numShares = documents[i].data().numShares;
        holdings.push(security); //push to holdings array
      }
    }
    //calculate total account value
    let totalValue = cash;
    // console.log("cash: ", cash);
    let stock = 0;
    for(let i = 0; i < holdings.length; i++){
      let securityVal = holdings[i].price * holdings[i].numShares;
      if(holdings[i].type == 'EQUITY'){
        stock = stock + securityVal;
      }
      totalValue = totalValue + securityVal;
    }
  
    //calculate new account allocation
    alloc.liquid = Math.round((cash / totalValue) * 100);
    alloc.stock = Math.round((stock / totalValue) * 100);
    alloc.mutualFunds = 100 - alloc.liquid - alloc.stock;
    // console.log("allocation: ", alloc);
    // console.log("stock: ", stock);
    // console.log("totalValue: ", totalValue);
    //update allocation on firestore
    let data = {
      accountValue: totalValue,
      allocation: alloc,
      securities: holdings 
    }
    await userRef.update({allocation: alloc})
      .then(() => res.status(200).json(data))
      .catch((error) => res.status(500).json(error));
  }
}