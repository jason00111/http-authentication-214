const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const app = express()

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))

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
  if ('username' in req.cookies) {
    res.type('html')
    res.send(`<p>Your username is</p><pre>${req.cookies.username}</pre>` + clearUsernameHtml)
  } else {
    res.type('html')
    res.send(getUsernameHtml)
  }
})

app.post('/', function (req, res) {
  res.cookie('username', req.body.username)
  res.type('html')
  res.send(`<p>Your username is</p><pre>${req.body.username}</pre>` + clearUsernameHtml)
})

app.post('/clear', function (req, res) {
  res.clearCookie('username')
  res.type('html')
  res.send(getUsernameHtml)
})

app.listen(3000, function () {
  console.log('Listening on port 3000!')
})
