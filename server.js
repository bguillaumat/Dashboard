var express = require('express');
var request = require('request');
var app = express();
var session = require('cookie-session');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var firebase = require("firebase");

var config = {
    apiKey: "AIzaSyBFkGiSYcEVGWoeKFfdOz6lvZ4sdYkOhC4",
    authDomain: "dashboard-epitech-7167a.firebaseapp.com",
    databaseURL: "https://dashboard-epitech-7167a.firebaseio.com",
    projectId: "dashboard-epitech-7167a",
    storageBucket: "dashboard-epitech-7167a.appspot.com",
    messagingSenderId: "256937319284"
};
firebase.initializeApp(config);

var openweathermeteo = function(city, callback){
    var  url = 'http://api.openweathermap.org/data/2.5/forecast/daily?q='+city+'&cnt=1&mode=json&units=metric&lang=fr&appid=521c8f8246c012c8421856de66e06c2a';

    request(url, function(err, response, body){
        try{
            var result = JSON.parse(body);
            var previsions = {
                temperature : result.list[0].temp.day,
                city : result.city.name,
                state : result.list[0].weather[0].main
            };

            callback(null, previsions);
        }catch(e){
            callback(e);
        }
    });
};

var result = 12;
let err = {code: false, msg: ""};
var widget = {meteo: true, etage: result};

app.use(session({secret: 'dashboard'}))

    .get('/', function(req, res) {
        console.log(firebase.auth.Auth.currentUser);
        res.render("log.ejs", {err});
    })

    .get('/main', function (req, res) {
        res.render("main_view.ejs", {widget});
    })

    .post('/signin/', urlencodedParser, function(req, res) {
        if (req.body.email !== '' && req.body.passwd) {
            firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.passwd).then((e) => {
                console.log(e);
                res.redirect("/main");
            }).catch(function(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                err.code = true;
                res.redirect("/");
            });
        }
        else {
            err = false;
            res.redirect("/");
        }
    })

    .post('/signup/', urlencodedParser, function (req, res) {
            if (req.body.email !== '' && req.body.passwd) {
                console.log(req.body.email, " ", req.body.passwd);
                firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.passwd).then((e) => {
                    console.log(e);
                    res.redirect("/main");
                }).catch(function(error) {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    err.code = true;
                    err.msg = errorMessage;
                    res.redirect("/");
                });
            }
            else {
                err.code = false;
                res.redirect("/");
            }
    })

    .use(function(req, res, next){
        res.redirect("/main");
        //res.setHeader('Content-Type', 'text/plain');
        //res.status(404).send('Erreur 404: Page introuvable!');
    });

app.listen(8080);