let express = require('express');
let request = require('request');
let app = express();
let session = require('cookie-session');
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false });
let store = require('store');
let firebase = require("firebase");

let config = {
    apiKey: "AIzaSyBFkGiSYcEVGWoeKFfdOz6lvZ4sdYkOhC4",
    authDomain: "dashboard-epitech-7167a.firebaseapp.com",
    databaseURL: "https://dashboard-epitech-7167a.firebaseio.com",
    projectId: "dashboard-epitech-7167a",
    storageBucket: "dashboard-epitech-7167a.appspot.com",
    messagingSenderId: "256937319284"
};
firebase.initializeApp(config);

let result = 12;
let err = {code: false, msg: ""};
let widget = {meteo: {state: true, data: {}}, etage: result};
let user = {state: false};

let openweathermeteo = function(city, callback){
    let  url = 'http://api.openweathermap.org/data/2.5/weather?q='+city+'&units=metric&lang=fr&appid=521c8f8246c012c8421856de66e06c2a';

    request(url, function(err, response, body){
        try{
            let result = JSON.parse(body);
            let previsions = {
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
        if (store.get('user') != null)
            res.redirect('/main');
        else
            res.render('log.ejs', {err});
    })

    .get('/main', function (req, res) {
        if (store.get('user') != null)
            res.render('main_view.ejs', {widget});
        else
            res.redirect('/login');
    })

    .get('/settings', function (req, res) {
        if (store.get('user') != null)
            res.render('settings.ejs', {widget});
        else
            res.redirect('/login');
    })

    .post('/signin/', urlencodedParser, function(req, res) {
        if (req.body.email !== '' && req.body.passwd) {
            firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.passwd).then((e) => {
                store.set('user', { data: e });
                res.redirect('/main');
            }).catch(function(error) {
                let errorCode = error.code;
                let errorMessage = error.message;
                err.code = true;
                err.msg = errorMessage;
                res.redirect('/login');
            });
        }
        else {
            err.code = true;
            err.msg = "Need an email and a password!";
            res.redirect('/login');
        }
    })

    .post('/signup/', urlencodedParser, function (req, res) {
            if (req.body.email !== '' && req.body.passwd) {
                console.log(req.body.email, " ", req.body.passwd);
                firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.passwd).then((e) => {
                    store.set('user', { data: e });
                    res.redirect('/main');
                }).catch(function(error) {
                    let errorCode = error.code;
                    let errorMessage = error.message;
                    err.code = true;
                    err.msg = errorMessage;
                    res.redirect('/login');
                });
            }
            else {
                err.code = true;
                err.msg = "Need an email and a password!";
                res.redirect('/login');
            }
    })
    
    .post('/signout/', urlencodedParser, function (req, res) {
        store.remove('user');
        res.redirect('/login');
    })

    .post('/settings/', urlencodedParser, function (req, res) {
        res.redirect('/settings');
    })
    
    .use(function(req, res, next){
        res.redirect('/login');
    });

app.listen(process.env.PORT || 8080);