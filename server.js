let express = require('express');
let app = express();
let session = require('cookie-session');
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false });
let store = require('store');
let firebase = require('firebase');
let steam = require('./scripts/steam');
let weather = require('./scripts/weather');
let yt = require('./scripts/youtube');
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
let widget = {meteo: {state: false, data: {city: 'Paris', temp: '', state: '', icon: ''}},
    steam: {state: false, data: {players: '', id: '578080', name: ''}},
    ytSub: {state: false, data: {id: 'UCUaHJ0fTA-1theR8A8Polmw', name: '', subs: ''}},
    ytViews: {state: false, data: {id: 'KcgGS3EvKYA', name: '', views: ''}},
    ytLast: {state: false, data: {id: 'KcgGS3EvKYA', nbr: 5, name: '', comments: []}}};


function wichWidget() {
    return new Promise(async resolve => {
        if (widget.meteo.state) {
            let prevision = await weather.askMeteo(widget.meteo.data.city);
            if (prevision != null) {
                widget.meteo.data.icon = prevision.icon;
                widget.meteo.data.temp = prevision.temperature;
                widget.meteo.data.state = prevision.state;
            }
            else
                widget.meteo.data.temp = null;
        }
        if (widget.steam.state) {
            widget.steam.data.name = await steam.askSteamName(widget.steam.data.id);
            widget.steam.data.players = await steam.askSteam(widget.steam.data.id, widget.steam.data.name);
        }
        if (widget.ytSub) {
            let data = await yt.askChannel(widget.ytSub.data.id);
            if (data) {
                widget.ytSub.data.name = data.name;
                widget.ytSub.data.subs = data.subs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            }
            else
                widget.ytSub.data.subs = null;
        }
        if (widget.ytViews) {
            let data = await yt.askViews(widget.ytViews.data.id);
            if (data) {
                widget.ytViews.data.name = data.name;
                widget.ytViews.data.views = data.views.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            }
            else
                widget.ytViews.data.views = null;
        }
        if (widget.ytLast) {
            widget.ytLast.data.comments = await yt.askComments(widget.ytLast.data.id, widget.ytLast.data.nbr);
        }
        console.log(widget);
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