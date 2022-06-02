var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  // res.send('respond with a resource');
  console.log("roomName");
  res.render('index', {
    title: 'The Dice House: ',
    room: req.params.roomName
  });
});

module.exports = router;
