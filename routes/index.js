var express = require('express');
var router = express.Router();
var multer = require('multer'); /*handles multiform data*/
var fs = require('fs');
var cheerio = require('cheerio');

var basex = require('basex');
var client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
client.execute("OPEN Colenso");

var tei = "XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0'; ";
var fileName = "";

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Colenso Project' });
});

/* Get Contibute page */
router.get('/contribute', function(req, res) {
    res.render('contribute', { title: 'Colenso Project' , message:""});
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

/*Get Search Page*/
router.get('/search', function(req, res) {

    var tei = "XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';";
    if(req.query.searchString){
        var searchStrArray = req.query.searchString.split(" ");
        var queryType = "";

            queryType += searchStrArray[0];
            if(1 < searchStrArray.length){
                if(searchStrArray[1] ==="OR"){
                    queryType += "' ftor '";
                }else if(searchStrArray[1] === "AND"){
                    queryType += "' ftand '";
                }else if(searchStrArray[1] === "NOT"){
                    queryType += "' ftand ftnot '";
                }else if(searchStrArray[0] === "NOT"){
                    queryType += "'ftand ftnot '";
                }else if(searchStrArray[0] === "NOT"){
                    queryType += "'ftand ftnot '";
                }else{
                    queryType += " ";
                    queryType += array[1];
                }
                queryType += searchStrArray[2];
            }
    }
    var query = tei + "for $t in (collection('Colenso')[. contains text ' "  + queryType +"' using wildcards])\n" +
        " return ('<p class=\"searchResult\">', db:path($t), '</p>')";
    client.execute(query,
        function (error, result) {
            if(error){ console.error(error)}
            else {
                if(req.query.searchString == undefined || req.query.searchString == null){
                    res.render('search', { title: 'Colenso Databse', results: " "});
                }else{
                    var splitlist = result.result.split("\n")
                    res.render('search', { title: 'Colenso Project', results: splitlist});
                }
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
                fileName = req.query.filename;
                var name = result.result.match(/<title>[\s\S]*?<\/title>/)[0];
                name = name.replace("<title>", "");
                name = name.replace("</title>", "");
                res.render('file', { title: 'Colenso Project', name: name, data: result.result });
            }
        }
    );
});

/*Get XQuery Page*/
router.get("/XQuery",function(req,res){
    var tei = "XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';";
    var query =  tei + "for $t in "  +req.query.searchString +
        " return db:path($t)";
    client.execute(query,
        function (error, result) {
            if(error){ console.error(error);}
            else {
                var splitlist = result.result.split("\n");
                res.render('XQuery', { title: 'Colenso Project', results: splitlist});
            }
        }
    );
});

/*Download File*/
router.get('/download', function(req, res) {
    client.execute("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
        "(doc('Colenso/"+fileName+"'))[1]",
        function (error, result) {
            if(error){
                console.error(error);
            }
            else {
                res.writeHead(200, {
                    'Content-Type': 'application/force-download','Content-disposition': 'attachment; filename=' + fileName,
                });

                res.write(result.result);
                res.end();

            }
        });
});

/*Get Raw XML*/
router.get("/xml",function(req,res){
    client.execute(tei + "(doc('Colenso/"+fileName+"'))[1]",
        function (error, result) {
            if(error){
                console.error(error);
            }
            else {
                var name = result.result.match(/<title>[\s\S]*?<\/title>/)[0];
                name = name.replace("<title>", "");
                name = name.replace("</title>", "");
                res.render('xml', {name: name, data: result.result });
            }
        });
});

module.exports = router;