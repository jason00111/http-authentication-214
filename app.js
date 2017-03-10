const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const app = express()

app.use(cookieParser())
app.use(bodyParser())

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
  console.log('Cookies:', req.cookies)
})

app.post('/', function (req, res) {
  res.send('your username is ' + req.body.username)
})

app.listen(3000, function () {
  console.log('Listening on port 3000!')
})
