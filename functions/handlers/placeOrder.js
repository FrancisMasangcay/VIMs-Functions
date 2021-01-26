const tFunc = require('../util/completeTransaction');
const { getQuote } = require('../util/helpers')

module.exports= async (req, res) => {
  let order = {};
  let result = await getQuote(`${req.body.symbol}`).catch((err) => {console.log(err)});
  order.price = result.price;
  order.username = req.user.username;
  order.shares = req.body.shares;
  order.symbol = req.body.symbol;
  order.buy = req.body.buy;
  if(result.type === 'EQUITY'){
    order.stock = true;
    order.mutualFund = false;
  }
  else{
    order.stock = false;
    order.mutualFund = true;
  }

  tFunc.completeTransaction(order)
    .then((_message) =>{
      return res.status(201).json(_message);
    })
    .catch((error) =>{
      console.log(error)
      return res.status(500).json(error);
    })
}