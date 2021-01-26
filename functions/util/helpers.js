/**
 * Helper functions
 */

const unirest = require('unirest');

const functions = require("firebase-functions");

exports.isEmpty = (string) => {
  if(string.trim() === "") return true;
  return false;
}

exports.isEmail = (string) => {
  let regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(string.match(regEx)) return true;
  return false;
}

/**
 * returns price and quoteType of a security using yFinance api
 * takes in a symbol for stock and a call back function to return to
 * 
 * result  = {
 *  price: 100,
 *  type: EQUITY | MUTUALFUND
 * }
 */
exports.getQuote = (symbol) => {
  return new Promise((resolve, reject) => {
    var request = unirest("GET", "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-statistics");
    
    request.query({
      "symbol": `${symbol}`,
      "region": "US"
    });
  
    request.headers({
      "x-rapidapi-key": `${functions.config().rapidapi.key}`,
      "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
      "useQueryString": true
    });
  
    request.end(function (response) {
      if (response.error) return reject(response.error);
      let result = {
        price: response.body.price.regularMarketPrice.raw,
        type: response.body.quoteType.quoteType
      };
      return resolve(result);
    });
  })
}

