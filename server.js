// Set up required constants
const express = require("express")
const app = express()
const db = require("./database.js");
const morgan = require('morgan');
const fs = require('fs')

// Use Express to read urlencoded and json
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Create and specify port
const args = require('minimist')(process.argv.slice(2))
args['port', 'debug', 'log', 'help']
const port = args.port || process.env.PORT || 5555;

// Help messages
if (args.help == true) {
    // console.log('server.js [options]')
    console.log('--port     Set the port number for the server to listen on. Must be an integer between 1 and 65535.\n')
    console.log('--debug    If set to `true`, creates endlpoints /app/log/access/ which returns a JSON access log from the database and /app/error which throws an error with the message "Error test successful." Defaults to `false`.\n')
    console.log('--log      If set to false, no log files are written. Defaults to true. Logs are always written to database.\n')
    console.log('--help     Return this message and exit.')
    process.exit(0)
}

// Set up middleware for logs file
if (args.log == true) {
    const WRITESTREAM = fs.createWriteStream('FILE', {flags : 'a'});
    app.use(morgan('FORMAT', { stream: WRITESTREAM }))
}

// Start an app server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',port))
});

// MIDDLEWARE CODE
app.use( (req, res, next) => {
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        secure: req.secure,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
      }
    const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url,  protocol, httpversion, secure, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const info = stmt.run(logdata.remoteaddr.toString(), logdata.remoteuser, logdata.time, logdata.method.toString(), logdata.url.toString(), logdata.protocol.toString(), logdata.httpversion.toString(), logdata.secure.toString(), logdata.status.toString(), logdata.referer, logdata.useragent.toString())
    next()
 })

 app.get('/app/', (req, res) => {
    // Respond with status 200
      res.statusCode = 200;
    // Respond with status message "OK"
      res.statusMessage = 'OK';
      res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
      res.end(res.statusCode+ ' ' +res.statusMessage)
  });

// ENDPOINTS

// endpoints for if debug == true
if (args.debug == true) {
    app.get('/app/log/access', (req, res) => {
        try {
            const stmt = db.prepare('SELECT * FROM accesslog').all()
            res.status(200).json(stmt)
            } catch(e) {
              console.error(e)
            }
    })

    app.get('/app/error', (req, res) => {
        res.status(500);
        throw new Error('Error test successful.');
    })
}

app.get('/app/flip/', (req, res) => {
    let flip = coinFlip();
    res.status(200).json({'flip' : flip})
});

// Endpoint returns json object with raw number of flips and summary 
app.get('/app/flips/:number', (req, res) => {
	let raw_flips = coinFlips(req.params.number);
    let sum_flips = countFlips(raw_flips)
    res.json({'raw': raw_flips, 'summary': sum_flips})
});

// Return result of flip
app.get('/app/flip/call/heads', (req, res) => {
    res.status(200).json(flipACoin('heads'));
})

app.get('/app/flip/call/tails', (req, res) => {
    res.status(200).json(flipACoin('tails'));
})

// Coin functions

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