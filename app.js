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
      res.cookie('session', encrypt(req._session))
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
    req.setSession(decrypt(req.cookies.session))
  } else {
    req.resetSession()
  }

  next()
}

function encrypt (sessionObject) {
  const rawString = JSON.stringify(sessionObject)
  const encryptedString = rawString.split('').map(
    char => String.fromCharCode(char.charCodeAt(0) + 7)
  ).join('')
  return encryptedString
}

function decrypt (encryptedString) {
  const rawString = encryptedString.split('').map(
    char => String.fromCharCode(char.charCodeAt(0) - 7)
  ).join('')
  return JSON.parse(rawString)
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
