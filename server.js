let express = require('express');
let app = express();
let session = require('cookie-session');
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false });
let store = require('store');
let firebase = require('firebase');
let steam = require('./scripts/steam');
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
let widget = {meteo: {state: false, data: {city: '', temp: '', state: '', icon: ''}, timer: 6},
    steam: {state: false, data: {players: '', id: '', name: ''}, timer: 6},
    ytSub: {state: false, data: {id: '', name: '', subs: ''}, timer: 6},
    ytViews: {state: false, data: {id: '', name: '', views: ''}, timer: 6},
    ytLast: {state: false, data: {id: '', nbr: 5, name: '', comments: []}, timer: 6}};

function wichWidget() {
    return new Promise(async resolve => {
        if (widget.meteo.state && widget.meteo.data.city !== '') {
            await widgets.meteo(widget);
            setInterval(async function () {
                await widgets.meteo(widget);
            }, widget.meteo.timer * 1000);
        }
        if (widget.steam.state && widget.steam.data.id !== '') {
            await widgets.steam(widget);
            setInterval(async function () {
                await widgets.steam(widget);
            }, widget.steam.timer * 1000);
        }
        if (widget.ytSub && widget.ytSub.data.id !== '') {
            await widgets.ytSubs(widget);
            setInterval(async function () {
                await widgets.ytSubs(widget);
            }, widget.ytSub.timer * 1000);
        }
        if (widget.ytViews && widget.ytViews.data.id !== '') {
            await widgets.ytViews(widget);
            setInterval(async function () {
                await widgets.ytViews(widget);
            }, widget.ytViews.timer * 1000);
        }
        if (widget.ytLast && widget.ytLast.data.id !== '') {
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
                        widget.meteo.state = doc.data().meteo.state;
                        widget.meteo.data.city = doc.data().meteo.city;
                        widget.meteo.timer = doc.data().meteo.timer;
                        widget.steam.state = doc.data().steam.state;
                        widget.steam.data.id = doc.data().steam.id;
                        widget.steam.timer = doc.data().steam.timer;
                        widget.ytSub.state = doc.data().ytSub.state;
                        widget.ytSub.data.id = doc.data().ytSub.id;
                        widget.ytSub.timer = doc.data().ytSub.timer;
                        widget.ytViews.state = doc.data().ytViews.state;
                        widget.ytViews.data.id = doc.data().ytViews.id;
                        widget.ytViews.timer = doc.data().ytViews.timer;
                        widget.ytLast.state = doc.data().ytLast.state;
                        widget.ytLast.data.id = doc.data().ytLast.id;
                        widget.ytLast.data.nbr = doc.data().ytLast.nbr;
                        widget.ytLast.timer = doc.data().ytLast.timer;
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
                meteo: {state: false, city: '', timer: 6},
                steam: {state: false, id: '', timer: 6},
                ytSub: {state: false, id: '', timer: 6},
                ytViews: {state: false, id: '', timer: 6},
                ytLast: {state: false, id: '', nbr: 5, timer: 6},
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
        if (req.body.mTimer > 5)
            widget.meteo.timer = req.body.mTimer;
        if (req.body.location !== '') {
            widget.meteo.data.city = req.body.location;
        }
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            meteo: {state: widget.meteo.state, city: widget.meteo.data.city, timer: widget.meteo.timer}
        }).then(function () {
            res.redirect('/settings');
        })
            .catch(function (error) {

            });
        res.redirect('/settings');
    })

    .post('/updateSteam/', urlencodedParser, async function (req, res) {
        widget.steam.state = req.body.sState === "on";
        if (req.body.sTimer > 5)
            widget.steam.timer = req.body.sTimer;
        console.log(widget.steam.timer);
        if (req.body.id !== '') {
            widget.steam.data.id = req.body.id;
            widget.steam.data.name = await steam.askSteamName(widget.steam.data.id);
        }
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            steam: {id: widget.steam.data.id, state: widget.steam.state, timer: widget.steam.timer}
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        if (widget.steam.data.name == null)
            widget.steam.data.name = '';
        res.redirect('/settings');
    })

    .post('/updateSub/', urlencodedParser, async function (req, res) {
        widget.ytSub.state = req.body.subState === "on";
        if (req.body.subTimer > 5)
            widget.ytSub.timer = req.body.subTimer;
        if (req.body.subid !== '') {
            widget.ytSub.data.id = req.body.subid;
            widget.ytSub.data.name = '';
        }
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            ytSub: {id: widget.ytSub.data.id, state: widget.ytSub.state, timer: widget.ytSub.timer}
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        if (widget.ytSub.data.name == null)
            widget.ytSub.data.name = '';
        res.redirect('/settings');
    })

    .post('/updateViews/', urlencodedParser, async function (req, res) {
        widget.ytViews.state = req.body.vState === "on";
        if (req.body.vTimer > 5)
            widget.ytViews.timer = req.body.vTimer;
        if (req.body.vid !== '') {
            widget.ytViews.data.id = req.body.vid;
            widget.ytViews.data.name = '';
        }
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            ytViews: {id: widget.ytViews.data.id, state: widget.ytViews.state, timer: widget.ytViews.timer}
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        if (widget.ytViews.data.name == null)
            widget.ytViews.data.name = '';
        res.redirect('/settings');
    })

    .post('/updateLast/', urlencodedParser, async function (req, res) {
        widget.ytLast.state = req.body.lState === "on";
        if (req.body.lTimer > 5)
            widget.ytLast.timer = req.body.lTimer;
        if (req.body.nbr > 0)
            widget.ytLast.data.nbr = req.body.nbr;
        if (req.body.lid !== '') {
            widget.ytLast.data.id = req.body.lid;
            widget.ytLast.data.name = '';
        }
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            ytLast: {id: widget.ytLast.data.id, state: widget.ytLast.state, nbr: widget.ytLast.data.nbr, timer: widget.ytLast.timer}
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        if (widget.ytLast.data.name == null)
            widget.ytLast.data.name = '';
        res.redirect('/settings');
    })
    
    .use(function(req, res, next){
        res.redirect('/login');
    });

app.listen(process.env.PORT || 8080);