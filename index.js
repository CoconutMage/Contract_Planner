const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// sendFile will go here
//include subdir
app.use(express.static('public'));

//This I think gets specific files, but its not needed atm cause public dir is all included
/*app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});
app.get('/script.js', function(req, res){
    res.sendFile(__dirname + '/script.js');
});*/

app.listen(port);
console.log('Server started at http://localhost/:' + port);
//Bazinga