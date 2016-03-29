var express = require('express');
var router = express.Router();
var multer = require('multer'); /*handles multiform data*/
var fs = require('fs');
var cheerio = require('cheerio');

var basex = require('basex');
var client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
client.execute("OPEN Colenso");

var tei = "XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0'; ";

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Colenso Project' });
});


/*Get Browse Page*/
router.get("/browse",function(req,res){
    client.execute("XQUERY db:list('Colenso')",
        function (error, result) {
            if(error){ console.error(error);}
            else {
                var splitlist = result.result.split("\n")
                res.render('browse', { title: 'Colenso Project', results: splitlist });
            }
        }
    );
});


/* GET xml file from database. */
router.get('/file', function(req, res) {
    var query = "XQUERY doc('Colenso/" + req.query.filename + "')";
    client.execute(query,
        function (error, result) {
            if(error) {
                console.error(error);
            }
            else {
                res.render('file', { title: 'Colenso Project', data: result.result });
            }
        }
    );
});

module.exports = router;