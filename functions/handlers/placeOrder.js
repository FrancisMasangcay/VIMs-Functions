const tFunc = require('../util/completeTransaction');
const { getQuote } = require('../util/helpers')

module.exports= async (req, res) => {
  //validate the request data
  if(req.body.symbol == "")
    return res.status(400).json({symbol: 'Must not be empty'});

  //check if it is a valid trading time and day
  let date = new Date();
  let day = date.getDay();
  
  if(day < 1 || day > 5 )
    return res.status(400).json({msg: "Markets are closed today. Please try again on a valid trading day."})

  let timeHrs = date.getUTCHours()
  let timeMin = date.getUTCMinutes()
  let hrsMinutes = timeHrs + (timeMin / 60);

  if( hrsMinutes < 14.5 || hrsMinutes >= 21 )
    return res.status(400).json({msg: "Markets are closed at this hour. Please try again during valid trading hours."})

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