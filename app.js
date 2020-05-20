const express = require('express')

// Init app
const app = express();

// Home Route
app.get('/', function(req, res) {
  res.send('Hello world');
});

// Start Server
app.listen(3000, function() {
  console.log('server started on port 3000')
})