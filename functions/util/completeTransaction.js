/**
 *  updates cash ammount, holdings, and transactions collections
 *  after a given buy or sell order
 *  
 * @param order 
 * {
 *    username: user,
 *    symbol: "AAPL",
 *    price: 35,
 *    shares: 1,
 *    buy: true | false,
 *    stock: true | false,
 *    mutualFund: true | false
 * }
 */

  const { db } = require('../util/admin');
  
  module.exports = {
    completeTransaction: async (order) => {
      //pull current data (cash ammount, holdings)
      let _message = {};
      const userRef = db.collection('users').doc(`${order.username}`);
      const hRef = userRef.collection('holdings').doc(`${order.symbol}`);
      const tRef = userRef.collection('transactions');
      const p = [userRef.get(), hRef.get()]
      const promises = await Promise.all(p).catch((error) => {_message.msg = error});
    
      let userSnap = promises[0];
      let holdingsSnap = promises[1];
    
      let failed = false;
      let total = order.shares * order.price;
      let acctCash = userSnap.data().cash;
      let holdings = 0;
      let newAmmount;
      let newShares;
      let hIsEmpty = false;
    
      if(holdingsSnap.exists){
        holdings = holdingsSnap.data().numShares;
      }
      else{
        hIsEmpty = true;
      }
      
      if(order.buy){ //buy order
        if(acctCash >= total){
          newAmmount = acctCash - total;
          newShares = holdings + order.shares;
          _message.msg = `Buy order complete: bought ${order.shares} share(s) of ${order.symbol} `;
          let transaction = {
            symbol: order.symbol,
            date: new Date().toISOString(),
            value: total,
            order: 'buy',
            shares: order.shares
          };
          await tRef.add(transaction).catch((error) => {_message.msg = error.code});
        }
        else{
          _message.msg = "Lacking funds in account";
          failed = true;
        }
      }
      else{ //sell order
        if(holdings >= order.shares){
          newAmmount = acctCash + total;
          newShares = holdings - order.shares;
          _message.msg = `Sell order complete: sold ${order.shares} share(s) of ${order.symbol} `;
          let transaction = {
            symbol: order.symbol,
            date: new Date().toISOString(),
            value: total,
            order: 'sell',
            shares: order.shares
          };
          await tRef.add(transaction).catch((error) => {_message.msg = error.code});
        }
        else{
          _message.msg = "Lacking shares in account";
          failed = true;
        }
      }
    
      if(!failed){
        //update firestore
        const p2 = [userRef.update({cash: newAmmount})]
        if(hIsEmpty){
          let newHolding = {
            symbol: order.symbol,
            numShares: order.shares,
            stock: order.stock,
            mutualFund: order.mutualFund
          };
          const promise = hRef.set(newHolding);
          p2.push(promise);
        }
        else{
          console.log(newShares);
          const promise = hRef.update({numShares: newShares})
          p2.push(promise);
        }
        await Promise.all(p2).catch((error) => {_message.msg = error});
      }
      return new Promise((resolve, reject) =>{
        if(failed)
          reject(_message);
        resolve(_message);
      });
    }
  }