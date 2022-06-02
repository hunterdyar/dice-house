var express = require('express');
var router = express.Router();



/* GET home page. */
router.get('/:room', function(req, res, next) {
    res.render('index', {
        title: 'The Dice House: ',
        room: req.params.room
    });
});
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'The Dice House: ',
        room: ''
    });
});

module.exports = router;
