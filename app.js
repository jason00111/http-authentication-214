var express = require('express')
var cookieParser = require('cookie-parser')

var app = express()

app.use(cookieParser())

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
  console.log('Cookies:', req.cookies)
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
