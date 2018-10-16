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
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE)
    .then(function() {
        // Existing and future Auth states are now persisted in the current
        // session only. Closing the window would clear any existing state even
        // if a user forgets to sign out.
        // ...
        // New sign-in will be persisted with session persistence.
        return firebase.auth().signInWithEmailAndPassword(email, password);
    })
    .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
    });

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

function connectFC(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
    });
}

var result = 12;
let err = false;
var widget = {meteo: true, etage: result};

app.use(session({secret: 'dashboard'}));


app.get('/', function(req, res) {
    res.render("log.ejs", {err});
});

app.get('/main', function (req, res) {
    res.render("main_view.ejs", {widget});
});

app.post('/signin/', urlencodedParser, function(req, res) {
    if (req.body.email !== '' && req.body.passwd) {
        firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.passwd).then((e) => {
            console.log(e);
            res.redirect("/main");
        }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            err = true;
            res.redirect("/");
        });
    }
    else
        return;
});

app.use(function(req, res, next){
    res.redirect("/main");
    //res.setHeader('Content-Type', 'text/plain');
    //res.status(404).send('Erreur 404: Page introuvable!');
});

app.listen(8080);