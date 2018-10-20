let express = require('express');
let app = express();
let session = require('cookie-session');
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false });
let store = require('store');
let firebase = require('firebase');
let widgets = require('./scripts/widgets');
let config = {
    apiKey: "AIzaSyBFkGiSYcEVGWoeKFfdOz6lvZ4sdYkOhC4",
    authDomain: "dashboard-epitech-7167a.firebaseapp.com",
    databaseURL: "https://dashboard-epitech-7167a.firebaseio.com",
    projectId: "dashboard-epitech-7167a",
    storageBucket: "dashboard-epitech-7167a.appspot.com",
    messagingSenderId: "256937319284"
};
firebase.initializeApp(config);
let db = firebase.firestore();
let err = {code: false, msg: ""};
let widget = {meteo: {state: false, data: {city: 'Paris', temp: '', state: '', icon: ''}, timer: 6},
    steam: {state: false, data: {players: '', id: '578080', name: ''}, timer: 6},
    ytSub: {state: false, data: {id: 'UCUaHJ0fTA-1theR8A8Polmw', name: '', subs: ''}, timer: 6},
    ytViews: {state: false, data: {id: 'KcgGS3EvKYA', name: '', views: ''}, timer: 6},
    ytLast: {state: false, data: {id: 'KcgGS3EvKYA', nbr: 5, name: '', comments: []}, timer: 6}};

function wichWidget() {
    return new Promise(async resolve => {
        if (widget.meteo.state) {
            await widgets.meteo(widget);
            setInterval(async function () {
                await widgets.meteo(widget);
            }, widget.meteo.timer * 1000);
        }
        if (widget.steam.state) {
            await widgets.steam(widget);
            setInterval(async function () {
                await widgets.steam(widget);
            }, widget.steam.timer * 1000);
        }
        if (widget.ytSub) {
            await widgets.ytSubs(widget);
            setInterval(async function () {
                await widgets.ytSubs(widget);
            }, widget.ytSub.timer * 1000);
        }
        if (widget.ytViews) {
            await widgets.ytViews(widget);
            setInterval(async function () {
                await widgets.ytViews(widget);
            }, widget.ytViews.timer * 1000);
        }
        if (widget.ytLast) {
            await widgets.ytLast(widget);
            setInterval(async function () {
                await widgets.ytLast(widget);
            }, widget.ytLast.timer * 1000);
        }
        resolve(true);
    });
}

app.use(session({secret: 'dashboard'}))

    .get('/login', function(req, res) {
        if (store.get('user') != null)
            res.redirect('/main');
        else
            res.render('log.ejs', {err});
    })

    .get('/main', async function (req, res) {
        if (store.get('user') != null) {
            await wichWidget();
            res.render('main_view.ejs', {widget});
        }
        else
            res.redirect('/login');
    })

    .get('/about.json', function (req, res) {
        if (store.get('user') != null)
            res.render('json.ejs');
        else
            res.render('log.ejs', {err});
    })

    .get('/permissions', function (req, res) {
        if (store.get('user') != null) {
            db.collection('Users').doc(store.get('user').data.user.uid)
                .get()
                .then(doc => {
                    if (!doc.exists) {
                        res.redirect('/main');
                    } else {
                        widget.meteo.state = doc.data().meteo;
                        widget.steam.state = doc.data().steam;
                        widget.ytSub.state = doc.data().ytSub;
                        widget.ytViews.state = doc.data().ytViews;
                        widget.ytLast.state = doc.data().ytLast;
                        res.redirect('/main');
                    }
                })
                .catch(err => {
                });
        }
        else
            res.redirect('/login');
    })

    .get('/settings', function (req, res) {
        if (store.get('user') != null)
            res.render('settings.ejs', {widget});
        else
            res.redirect('/login');
    })

    .get('/createuser', function (req, res) {
        if (store.get('user') != null)
            db.collection("Users").doc(store.get('user').data.user.uid).set({
                meteo: false,
                steam: false,
                ytSub: false,
                ytLast: false,
                ytViews: false
            })
                .then(function() {
                    res.redirect('/permissions');
                })
                .catch(function(error) {
                });
        else
            res.redirect('/login');
    })

    .post('/signin/', urlencodedParser, function(req, res) {
        if (req.body.email !== '' && req.body.passwd) {
            firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.passwd).then((e) => {
                store.set('user', { data: e });
                res.redirect('/permissions');
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
                firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.passwd).then((e) => {
                    store.set('user', { data: e });
                    res.redirect('/createuser');
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
        firebase.auth().signOut();
        store.remove('user');
        res.redirect('/login');
    })

    .post('/settings/', urlencodedParser, function (req, res) {
        res.redirect('/settings');
    })

    .post('/main/', urlencodedParser, function (req, res) {
        res.redirect('/main');
    })
    
    .post('/updateMeteo/', urlencodedParser, function (req, res) {
        widget.meteo.state = req.body.mState === "on";
        if (req.body.location !== '')
            widget.meteo.data.city = req.body.location;
        res.redirect('/settings');
    })

    .post('/updateSteam/', urlencodedParser, async function (req, res) {
        widget.steam.state = req.body.sState === "on";
        if (req.body.id !== '') {
            widget.steam.data.id = req.body.id;
            widget.steam.data.name = await steam.askSteamName(widget.steam.data.id);
        }
        if (widget.steam.data.name == null)
            widget.steam.data.name = '';
        res.redirect('/settings');
    })
    
    .use(function(req, res, next){
        res.redirect('/login');
    });

app.listen(process.env.PORT || 8080);