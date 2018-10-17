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

let openweathermeteo = function(city, callback){
    var  url = 'http://api.openweathermap.org/data/2.5/weather?q='+city+'&units=metric&lang=fr&appid=521c8f8246c012c8421856de66e06c2a';

    request(url, function(err, response, body){
        try{
            var result = JSON.parse(body);
            var previsions = {
                temperature : result.main.temp,
                city : result.name,
                state : result.weather[0].description
            };

            callback(null, previsions);
        }catch(e){
            callback(e);
        }
    });
};
let result = 12;
let err = {code: false, msg: ""};
let widget = {meteo: {state: false, data: {}}, etage: result};

function askMeteo(city) {
    openweathermeteo(city, function(err, previsions){
        if(err) return console.log(err);
        console.log('A ' + previsions.city + ', la température est de ' + previsions.temperature + '°C avec ' + previsions.state);
        return previsions;
    });
}

function wichWidget() {
    if (widget.meteo.state === true) {
        widget.meteo.data = openweathermeteo(city);
    }
}

app.use(session({secret: 'dashboard'}))

    .get('/login', function(req, res) {
        res.render("log.ejs", {err});
    })

    .get('/main', function (req, res) {
        res.render("main_view.ejs", {widget});
    })

    .post('/signin/', urlencodedParser, function(req, res) {
        if (req.body.email !== '' && req.body.passwd) {
            firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.passwd).then((e) => {
                res.redirect("/main");
            }).catch(function(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                err.code = true;
                err.msg = errorMessage;
                res.redirect("/login");
            });
        }
        else {
            err.code = true;
            err.msg = "Need an email and a password!";
            res.redirect("/login");
        }
    })

    .post('/signup/', urlencodedParser, function (req, res) {
            if (req.body.email !== '' && req.body.passwd) {
                console.log(req.body.email, " ", req.body.passwd);
                firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.passwd).then((e) => {
                    res.redirect("/main");
                }).catch(function(error) {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    err.code = true;
                    err.msg = errorMessage;
                    res.redirect("/login");
                });
            }
            else {
                err.code = true;
                err.msg = "Need an email and a password!";
                res.redirect("/login");
            }
    })

    .use(function(req, res, next){
        res.redirect("/login");
    });

app.listen(8080);