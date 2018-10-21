const requestIp = require('request-ip');
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
let widget = {meteo: {state: false, data: {city: '', temp: '', state: '', icon: ''}, timer: 5},
    steam: {state: false, data: {players: '', id: '', name: ''}, timer: 5},
    ytSub: {state: false, data: {id: '', name: '', subs: ''}, timer: 5},
    ytViews: {state: false, data: {id: '', name: '', views: ''}, timer: 5},
    ytLast: {state: false, data: {id: '', nbr: 5, name: '', comments: []}, timer: 5},
    reddit: {state: false, data: {sub: '', nbr: 5, posts: []}, timer: 5}
};
let allWidgets = {meteo: [],
    steam: [],
    ytSub: [],
    ytViews: [],
    ytLast: [],
    reddit: []};

function wichWidget() {
    return new Promise(async resolve => {
        for (let widget of allWidgets.meteo)
        {
            if (widget.state && widget.data.city !== '') {
                await widgets.meteo(widget);
                setInterval(async function () {
                    await widgets.meteo(widget);
                }, widget.timer * 1000 * 60);
            }
        }
        for (let widget of allWidgets.steam) {
            if (widget.state && widget.data.id !== '') {
                await widgets.steam(widget);
                setInterval(async function () {
                    await widgets.steam(widget);
                }, widget.timer * 1000 * 60);
            }
        }
        for (let widget of allWidgets.ytSub) {
            if (widget && widget.data.id !== '') {
                await widgets.ytSubs(widget);
                setInterval(async function () {
                    await widgets.ytSubs(widget);
                }, widget.timer * 1000 * 60);
            }
        }
        for (let widget of allWidgets.ytViews) {
            if (widget && widget.data.id !== '') {
                await widgets.ytViews(widget);
                setInterval(async function () {
                    await widgets.ytViews(widget);
                }, widget.timer * 1000 * 60);
            }
        }
        for (let widget of allWidgets.ytLast) {
            if (widget && widget.data.id !== '') {
                await widgets.ytLast(widget);
                setInterval(async function () {
                    await widgets.ytLast(widget);
                }, widget.timer * 1000 * 60);
            }
        }
        for (let widget of allWidgets.reddit) {
            if (widget && widget.data.sub !== '') {
                await widgets.reddit(widget);
                setInterval(async function () {
                    await widgets.reddit(widget);
                }, widget.timer * 1000 * 60);
            }
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
        let clientIp = requestIp.getClientIp(req);
        let epochTime = (new Date).getTime();
        res.render('json.ejs', {clientIp: clientIp, epochTime: epochTime});
    })

    .get('/permissions', function (req, res) {
        if (store.get('user') != null) {
            db.collection('Users').doc(store.get('user').data.user.uid)
                .get()
                .then(doc => {
                    if (!doc.exists) {
                        res.redirect('/main');
                    } else {
                        for (let data of doc.data().meteo)
                        {
                            allWidgets.meteo.push({state: data.state, data: {city: data.city, temp: '', state: '', icon: ''}, timer: data.timer});
                        }
                        for (let data of doc.data().steam)
                        {
                            allWidgets.steam.push({state: data.state, data: {id: data.id, temp: '', state: '', icon: ''}, timer: data.timer});
                        }
                        for (let data of doc.data().ytSub)
                        {
                            allWidgets.ytSub.push({state: data.state, data: {id: data.id, temp: '', state: '', icon: ''}, timer: data.timer});
                        }
                        for (let data of doc.data().ytViews)
                        {
                            allWidgets.ytViews.push({state: data.state, data: {id: data.id, temp: '', state: '', icon: ''}, timer: data.timer});
                        }
                        for (let data of doc.data().ytLast)
                        {
                            allWidgets.ytLast.push({state: data.state, data: {id: data.id, nbr: data.nbr, name: '', comments: []}, timer: data.timer});
                        }
                        for (let data of doc.data().reddit)
                        {
                            allWidgets.reddit.push({state: data.state, data: {sub: data.sub, nbr: data.nbr, posts: []}, timer: data.timer});
                        }
                        console.log(allWidgets);
                        /*allWidgets.meteo.state = doc.data().meteo.state;
                        allWidgets.meteo.data.city = doc.data().meteo.city;
                        allWidgets.meteo.timer = doc.data().meteo.timer;
                        allWidgets.steam.state = doc.data().steam.state;
                        allWidgets.steam.data.id = doc.data().steam.id;
                        allWidgets.steam.timer = doc.data().steam.timer;
                        allWidgets.ytSub.state = doc.data().ytSub.state;
                        allWidgets.ytSub.data.id = doc.data().ytSub.id;
                        allWidgets.ytSub.timer = doc.data().ytSub.timer;
                        allWidgets.ytViews.state = doc.data().ytViews.state;
                        allWidgets.ytViews.data.id = doc.data().ytViews.id;
                        allWidgets.ytViews.timer = doc.data().ytViews.timer;
                        allWidgets.ytLast.state = doc.data().ytLast.state;
                        allWidgets.ytLast.data.id = doc.data().ytLast.id;
                        allWidgets.ytLast.data.nbr = doc.data().ytLast.nbr;
                        allWidgets.ytLast.timer = doc.data().ytLast.timer;
                        allWidgets.reddit.timer = doc.data().reddit.timer;
                        allWidgets.reddit.state = doc.data().reddit.state;
                        allWidgets.reddit.data.sub = doc.data().reddit.sub;
                        allWidgets.reddit.data.nbr = doc.data().reddit.nbr;*/
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
                meteo: [{state: false, city: '', timer: 5}],
                steam: [{state: false, id: '', timer: 5}],
                ytSub: [{state: false, id: '', timer: 5}],
                ytViews: [{state: false, id: '', timer: 5}],
                ytLast: [{state: false, id: '', nbr: 5, timer: 5}],
                reddit: [{state: false, sub: '', nbr: 5, timer: 5}],
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
        let index = req.body.nbr;
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            meteo: firebase.firestore.FieldValue.arrayRemove({state: allWidgets.meteo[index].state, city: allWidgets.meteo[index].data.city, timer: allWidgets.meteo[index].timer})
        }).then(function () {
            res.redirect('/settings');
        })
            .catch(function (error) {

            });
        allWidgets.meteo[index].state = req.body.mState === "on";
        if (req.body.mTimer >= 1)
            allWidgets.meteo[index].timer = req.body.mTimer;
        if (req.body.location !== '') {
            allWidgets.meteo[index].data.city = req.body.location;
        }
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            meteo: firebase.firestore.FieldValue.arrayUnion({state: allWidgets.meteo[index].state, city: allWidgets.meteo[index].data.city, timer: allWidgets.meteo[index].timer})
        }).then(function () {
            res.redirect('/settings');
        })
            .catch(function (error) {

            });
        res.redirect('/settings');
    })

    .post('/updateSteam/', urlencodedParser, async function (req, res) {
        let index = req.body.nbr;
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            steam: firebase.firestore.FieldValue.arrayRemove({id: allWidgets.steam[index].data.id, state: allWidgets.steam[index].state, timer: allWidgets.steam[index].timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        allWidgets.steam[index].state = req.body.sState === "on";
        if (req.body.sTimer >= 1)
            allWidgets.steam[index].timer = req.body.sTimer;
        if (req.body.id !== '') {
            allWidgets.steam[index].data.id = req.body.id;
            allWidgets.steam[index].data.name = await steam.askSteamName(allWidgets.steam[index].data.id);
        }
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            steam: firebase.firestore.FieldValue.arrayUnion({id: allWidgets.steam[index].data.id, state: allWidgets.steam[index].state, timer: allWidgets.steam[index].timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        if (allWidgets.steam[index].data.name == null)
            allWidgets.steam[index].data.name = '';
        res.redirect('/settings');
    })

    .post('/updateSub/', urlencodedParser, async function (req, res) {
        let index = req.body.nbr;
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            ytSub: firebase.firestore.FieldValue.arrayRemove({id: allWidgets.ytSub[index].data.id, state: allWidgets.ytSub[index].state, timer: allWidgets.ytSub[index].timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        allWidgets.ytSub[index].state = req.body.subState === "on";
        if (req.body.subTimer >= 1)
            allWidgets.ytSub[index].timer = req.body.subTimer;
        if (req.body.subid !== '') {
            allWidgets.ytSub[index].data.id = req.body.subid;
            allWidgets.ytSub[index].data.name = '';
        }
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            ytSub: firebase.firestore.FieldValue.arrayUnion({id: allWidgets.ytSub[index].data.id, state: allWidgets.ytSub[index].state, timer: allWidgets.ytSub[index].timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        if (allWidgets.ytSub[index].data.name == null)
            allWidgets.ytSub[index].data.name = '';
        res.redirect('/settings');
    })

    .post('/updateViews/', urlencodedParser, async function (req, res) {
        let index = req.body.nbr;
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            ytViews: firebase.firestore.FieldValue.arrayRemove({id: allWidgets.ytViews[index].data.id, state: allWidgets.ytViews[index].state, timer: allWidgets.ytViews[index].timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        allWidgets.ytViews[index].state = req.body.vState === "on";
        if (req.body.vTimer >= 1)
            allWidgets.ytViews[index].timer = req.body.vTimer;
        if (req.body.vid !== '') {
            allWidgets.ytViews[index].data.id = req.body.vid;
            allWidgets.ytViews[index].data.name = '';
        }
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            ytViews: firebase.firestore.FieldValue.arrayUnion({id: allWidgets.ytViews[index].data.id, state: allWidgets.ytViews[index].state, timer: allWidgets.ytViews[index].timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        if (allWidgets.ytViews[index].data.name == null)
            allWidgets.ytViews[index].data.name = '';
        res.redirect('/settings');
    })

    .post('/updateLast/', urlencodedParser, async function (req, res) {
        let index = 0;
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            ytLast: firebase.firestore.FieldValue.arrayRemove({id: allWidgets.ytLast[index].data.id, state: allWidgets.ytLast[index].state, nbr: allWidgets.ytLast[index].data.nbr, timer: allWidgets.ytLast[index].timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        allWidgets.ytLast[index].state = req.body.lState === "on";
        if (req.body.lTimer >= 1)
            allWidgets.ytLast[index].timer = req.body.lTimer;
        if (req.body.nbr > 0)
            allWidgets.ytLast[index].data.nbr = req.body.nbr;
        if (req.body.lid !== '') {
            allWidgets.ytLast[index].data.id = req.body.lid;
            allWidgets.ytLast[index].data.name = '';
        }
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            ytLast: firebase.firestore.FieldValue.arrayUnion({id: allWidgets.ytLast[index].data.id, state: allWidgets.ytLast[index].state, nbr: allWidgets.ytLast[index].data.nbr, timer: allWidgets.ytLast[index].timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        if (allWidgets.ytLast[index].data.name == null)
            allWidgets.ytLast[index].data.name = '';
        res.redirect('/settings');
    })

    .post('/updateReddit/', urlencodedParser, async function (req, res) {
        let index = req.body.nbr;
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            reddit: firebase.firestore.FieldValue.arrayRemove({state: allWidgets.reddit[index].state, nbr: allWidgets.reddit[index].data.nbr, sub: allWidgets.reddit[index].data.sub, timer: allWidgets.reddit[index].timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        allWidgets.reddit[index].state = req.body.redditState === "on";
        if (req.body.redditTimer >= 1)
            allWidgets.reddit[index].timer = req.body.redditTimer;
        if (req.body.redditNbr > 0)
            allWidgets.reddit[index].data.nbr = req.body.redditNbr;
        if (req.body.redditId !== '') {
            allWidgets.reddit[index].data.sub = req.body.redditId;
        }
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            reddit: firebase.firestore.FieldValue.arrayUnion({state: allWidgets.reddit[index].state, nbr: allWidgets.reddit[index].data.nbr, sub: allWidgets.reddit[index].data.sub, timer: allWidgets.reddit[index].timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        if (allWidgets.reddit[index].data.sub == null)
            allWidgets.reddit[index].data.sub = '';
        res.redirect('/settings');
    })

    .use(function(req, res, next){
        res.redirect('/login');
    });

app.listen(process.env.PORT || 8080);