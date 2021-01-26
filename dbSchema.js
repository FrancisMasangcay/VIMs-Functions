let db = {
  users = {
      email: "user@gmail.com",
      first: "FirstName",
      last: "LastName",
      username: "user",
      userID: " ALDJWEIP219E3I1-Q2OEM",
      cash: 100000, //dollar ammount 
      allocation: {
        stock: 10, //percentages
        liquid: 90,
        mutualFunds: 0
      },
      transactions: [ //sub collection
        { 
            symbol: "AAPL",
            date: "An ISO date",
            value: 34, //in dollars
            order: 'buy' | 'sell',
            shares: 10
        }
      ],
      performance: [ //subcollection
        {
          date: "ISO DATE",
          endingValue: 30000 //dollar ammount
        },
        {
          date: "ISO DATE",
          endingValue: 5000 //dollar ammount
        }
      ],
      holdings: [ //subcollection
        {
          symbol: "AAPL",
          numShares: 10,
          stock: true | false,
          mutualFund: true | false
        }
      ]
    }
  }