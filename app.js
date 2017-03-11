const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const app = express()

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))

app.use(sessionMiddleware)

function sessionMiddleware (req, res, next) {
  if (!req.setSession) {
    req.setSession = function (sessionObject) {
      req._session = sessionObject
    }
    req.setSessionKey = function (key, value) {
      req._session[key] = value
      res.cookie('session', encrypt(JSON.stringify(req._session)))
    }
    req.getSessionKey = function (key) {
      return req._session[key]
    }
    req.resetSession = function () {
      req._session = {}
      res.clearCookie('session')
    }
  }

  if ('session' in req.cookies) {
    req.setSession(JSON.parse(decrypt(req.cookies.session)))
  } else {
    req.resetSession()
  }

  next()
}

var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

const getInformationHtml =
`<h1>Enter Your Information</h1>
<form method="post" action="/">
  <label>First Name:</label>
  <input type="text" name="firstName">
  <label>Last Name:</label>
  <input type="text" name="lastName">
  <label>Age:</label>
  <input type="text" name="age">
  <input type="submit" value="Send">
</form>`

const clearInformationHtml =
`<form method="post" action="/clear">
  <input type="submit" value="Clear Information">
</form>`

function sendUserInformation (req, res) {
  res.type('html')
  res.send(`<h1>Your Information</h1>
    <pre>First Name: ${req.getSessionKey('firstName')}</pre>
    <pre>Last Name: ${req.getSessionKey('lastName')}</pre>
    <pre>Age: ${req.getSessionKey('age')}</pre>` + clearInformationHtml)
}

app.get('/', function (req, res) {
  if (req.getSessionKey('username')) {
    sendUserInformation(req, res)
  } else {
    res.type('html')
    res.send(getInformationHtml)
  }
})

app.post('/', function (req, res) {
  req.setSessionKey('firstName', req.body.firstName)
  req.setSessionKey('lastName', req.body.lastName)
  req.setSessionKey('age', req.body.age)
  sendUserInformation(req, res)
})

app.post('/clear', function (req, res) {
  req.resetSession()
  res.type('html')
  res.send(getInformationHtml)
})

app.listen(3000, function () {
  console.log('Listening on port 3000!')
})
