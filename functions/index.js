/**
 * NOTES::: 
 * 
 */

const functions = require("firebase-functions");

const express = require('express');
const app = express();

const { json } = require('express');
const { Message } = require('firebase-functions/lib/providers/pubsub');

const { getPerformance, getTransactions} = require('./handlers/reads');
const { signUp, login, getAuthenticatedUser } = require('./handlers/users');
const FBAuth = require('./util/fbAuth');
const placeOrder = require('./handlers/placeOrder');
const updateFunc = require('./handlers/updateInfo');
const recordPerformanceFunc = require('./handlers/recordPerformance');

/**
 * GET ROUTES
 */

/**
 *  request schema:
 *  req.body = { }
 * 
 *  runs firestore queries to update account allocation and update holding values
 *  returns account information:
 *  {
 *    accountTotalValue: 10000,
 *    allocation: {
 *      stock: 90,
 *      liquid: 2,
 *      mutualFund: 8
 *    },
 *    securities: [
 *      {
 *        symbol: TSLA,
 *        price: 845,
 *        numShares: 5
 *      },
 *    ]
 *  }
 */
app.get('/updateInfo', FBAuth, updateFunc.updateInfo)

/**
 *  returns n most recent performance records
 *  takes in number of records requested and username
 *  as request fields
 * 
 *  request.body schema:
 *  {
 *    numRecords: 31
 *  }
 */
app.get('/performance', FBAuth, getPerformance)

/**
 *  returns n most recent transactions
 *  takes in number of transactions requested 
 *  and username as request fields
 * 
 *  request.body schema:
 *  {
 *    numRecords: 31
 *  }
 */
app.get('/transactions', FBAuth, getTransactions)

app.get('/user', FBAuth, getAuthenticatedUser);

/**
 * POST ROUTES
 */

 /**
  *  signup route
  *  req.body schema:
  *   {
  *     email: "someEmail@gmail.com",
  *     password "password",
  *     first: "first",
  *     last: "last",
  *     username: "user"
  *   }
  */
//create performance and transaction collections for each user upon first day and first order respectively
app.post('/signup', signUp)

//login route
/**
 * req.body schema:
 *  {
 *    email: "someEmail@gmail.com",
 *    password: "password"
 *  }
 * 
 *  returns a firebase token upon verification
 */
app.post('/login', login)
  
  
  /**
   * Buy/Sell Route
   * 
   * req.body schema:
   *  {
   *    "symbol": "TSLA",
   *    "shares": 118,
   *    "buy": true | false
   *  }
   */
app.post('/order', FBAuth, placeOrder)

/**
 *  req.body schema: 
 *  { }
 * 
 *  updates accountValue and then posts to the performance
 *  collection a new document detailing the end of day value
 *  of an account
 */
app.post('/performance', FBAuth, recordPerformanceFunc.performance)

exports.api = functions.https.onRequest(app);