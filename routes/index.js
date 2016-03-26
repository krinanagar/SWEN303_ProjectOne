var express = require('express');
var router = express.Router();
var multer = require('multer'); /*handles multiform data*/
var fs = require('fs');

var basex = require('basex');
var client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
client.execute("OPEN Colenso");

var tei = "XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0'; ";

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Colenso Project' });
});

/*Get Browse Page*/
router.get('/browse', function(req, res) {
  var query = tei +
      "for $n in (//title [. contains text '" + req.query.searchString + "'])\n" +
      "return concat('<a href=\"/file?filename= ../Colenso_TEIs/', db:path($n), '\" class=\"searchResult\">', $n, '</a>'," +
      "'<p class=\"searchResult\">', db:path($n), '</p>')";

  client.execute(query,
      function (error, result) {
        if(error) {
          console.error(error);
        }
        else {
          var nResults = (result.result.match(/<\/a>/g) || []).length;
          res.render('browse', { title: 'Colenso Project', results: result.result, nResults: nResults});
        }
      }
  );
});

module.exports = router;