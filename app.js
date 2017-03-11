const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const app = express()

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))

function sessionMiddleware (req, res, next) {
  if (!req.setSession) {
    req.setSession = function (sessionObject) {
      req._session = sessionObject
    }
    req.setSessionKey = function (key, value) {
      req._session[key] = value
      res.cookie('session', JSON.stringify(req._session))
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
    req.setSession(JSON.parse(req.cookies.session))
  } else {
    req.resetSession()
  }

  next()
}

app.use(sessionMiddleware)

const getUsernameHtml =
`<form method="post" action="/">
  <label>Enter username:</label>
  <input type="text" name="username">
  <input type="submit" value="Send">
</form>`

const clearUsernameHtml =
`<form method="post" action="/clear">
  <input type="submit" value="Clear Username">
</form>`

app.get('/', function (req, res) {
  if (req.getSessionKey('username')) {
    res.type('html')
    res.send(`<p>Your username is</p><pre>${req.getSessionKey('username')}</pre>` + clearUsernameHtml)
  } else {
    res.type('html')
    res.send(getUsernameHtml)
  }
})

app.post('/', function (req, res) {
  req.setSessionKey('username', req.body.username)
  res.type('html')
  res.send(`<p>Your username is</p><pre>${req.body.username}</pre>` + clearUsernameHtml)
})

app.post('/clear', function (req, res) {
  req.resetSession()
  res.type('html')
  res.send(getUsernameHtml)
})

app.listen(3000, function () {
  console.log('Listening on port 3000!')
})
