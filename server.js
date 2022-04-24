const http = require('http')

// Require Express.js
const express = require("express")
const app = express()

const args = require('minimist')(process.argv.slice(2))

args['port']

const port = args.port || process.env.PORT || 5000

// Start an app server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',port))
});

app.get("/app/", (req, res) => {
  res.status(200).end("OK");
  res.type("text/plain");
});

app.get('/app/flip', (req, res) => {
  var flip = coinFlip()
  res.status(200).json({
      'flip': flip
  })
})

app.get('/app/flips/:number', (req, res) => {
  var realFlips = coinFlips(req.params.number)
  var summaryFlips = countFlips(realFlips)
  res.status(200).json({
      'raw': realFlips,
      'summary': summaryFlips
  })
});

app.get('/app/flip/call/heads', (req, res) => {
  res.status(200).json(flipACoin('heads'))
})

app.get('/app/flip/call/tails', (req, res) => {
  res.status(200).json(flipACoin('tails'))
})

// Default response for any other request
app.use(function(req, res){
  res.status(404).send('404 NOT FOUND')
});


/*Coin functions*/

function coinFlip() {
  var result;
  var rand_num = Math.random();
  if (rand_num < 0.5) {
    result = "heads";
  } else {
    result = "tails";
  }
  return result;
}

function coinFlips(flips) {
  let flipList = [];
  let i = 0;
  for (let i=0; i < flips; i++) {
    flipList.push(coinFlip());
  }
  return flipList;
}

function countFlips(array) {
  var count;
  var heads = 0;
  var tails = 0;
  var i = 0;
  for (let i=0; i < array.length; i++) {
    if (array[i] === "tails") {
      tails += 1;
    } else {
      heads += 1;
    }
  }
  if (heads == 0) {
    count = { tails };
  } else if (tails == 0) {
    count = { heads };
  } else {
    count = { tails, heads };
  }
  return count;
}

function flipACoin(call) {
  var statement = {
    call,
    flip: coinFlip(),
    result: "",
  };
  if (statement.call === statement.flip) {
    statement.result = "win";
  } else {
    statement.result = "lose";
  }
  return statement;
}