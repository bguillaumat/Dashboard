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
const config = {
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

let allWidgets = {
    meteo: [],
    steam: [],
    ytSub: [],
    ytViews: [],
    ytLast: [],
    reddit: []};

const styleDir = require('path').join(__dirname,'/style');
app.use(express.static(styleDir));


const assetsDir = require('path').join(__dirname,'/assets');
app.use(express.static(assetsDir));

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
            res.render('main_view.ejs', {widgets: allWidgets});
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
                        allWidgets.meteo.length = 0;
                        allWidgets.ytLast.length = 0;
                        allWidgets.ytSub.length = 0;
                        allWidgets.ytViews.length = 0;
                        allWidgets.steam.length = 0;
                        allWidgets.reddit.length = 0;
                        for (let data of doc.data().meteo)
                        {
                            allWidgets.meteo.push({state: data.state, data: {city: data.city, temp: '', state: '', icon: ''}, timer: data.timer});
                        }
                        for (let data of doc.data().steam)
                        {
                            allWidgets.steam.push({state: data.state, data: {id: data.id, name: '', players: ''}, timer: data.timer});
                        }
                        for (let data of doc.data().ytSub)
                        {
                            allWidgets.ytSub.push({state: data.state, data: {id: data.id, subs: '', name: ''}, timer: data.timer});
                        }
                        for (let data of doc.data().ytViews)
                        {
                            allWidgets.ytViews.push({state: data.state, data: {id: data.id, views: '', name: ''}, timer: data.timer});
                        }
                        for (let data of doc.data().ytLast)
                        {
                            allWidgets.ytLast.push({state: data.state, data: {id: data.id, nbr: data.nbr, name: '', comments: []}, timer: data.timer});
                        }
                        for (let data of doc.data().reddit)
                        {
                            allWidgets.reddit.push({state: data.state, data: {sub: data.sub, nbr: data.nbr, posts: []}, timer: data.timer});
                        }
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
            res.render('settings.ejs', {widgets: allWidgets});
        else
            res.redirect('/login');
    })

    .get('/newWeather', function (req, res) {
        res.render('newWeather.ejs');
    })

    .get('/newSteam', function (req, res) {
        res.render('newSteam.ejs');
    })

    .get('/newReddit', function (req, res) {
        res.render('newReddit.ejs');
    })

    .get('/newYoutubeSub', function (req, res) {
        res.render('newYoutubeSub.ejs');
    })

    .get('/newYoutubeViews', function (req, res) {
        res.render('newYoutubeViews.ejs');
    })

    .get('/newYoutubeLast', function (req, res) {
        res.render('newYoutubeLast.ejs');
    })

    .get('/createuser', function (req, res) {
        if (store.get('user') != null)
            db.collection("Users").doc(store.get('user').data.user.uid).set({
                meteo: [],
                steam: [],
                ytSub: [],
                ytViews: [],
                ytLast: [],
                reddit: [],
            }).then(function() {
                res.redirect('/permissions');
            }).catch(function(error) {
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

    .post('/updateMeteo/:id', urlencodedParser, function (req, res) {
        let index = req.params.id;
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            meteo: firebase.firestore.FieldValue.arrayRemove({state: allWidgets.meteo[index].state, city: allWidgets.meteo[index].data.city, timer: allWidgets.meteo[index].timer})
        }).then(function () {
        }).catch(function (error) {
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
        }).catch(function (error) {
        });
        res.redirect('/settings');
    })

    .post('/updateSteam/:id', urlencodedParser, async function (req, res) {
        let index = req.params.id;
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            steam: firebase.firestore.FieldValue.arrayRemove({id: allWidgets.steam[index].data.id, state: allWidgets.steam[index].state, timer: allWidgets.steam[index].timer})
        }).then(function() {
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

    .post('/updateSub/:id', urlencodedParser, async function (req, res) {
        let index = req.params.id;
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            ytSub: firebase.firestore.FieldValue.arrayRemove({id: allWidgets.ytSub[index].data.id, state: allWidgets.ytSub[index].state, timer: allWidgets.ytSub[index].timer})
        }).then(function() {
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

    .post('/updateViews/:id', urlencodedParser, async function (req, res) {
        let index = req.params.id;
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            ytViews: firebase.firestore.FieldValue.arrayRemove({id: allWidgets.ytViews[index].data.id, state: allWidgets.ytViews[index].state, timer: allWidgets.ytViews[index].timer})
        }).then(function() {
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

    .post('/updateLast/:id', urlencodedParser, async function (req, res) {
        let index = req.params.id;
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            ytLast: firebase.firestore.FieldValue.arrayRemove({id: allWidgets.ytLast[index].data.id, state: allWidgets.ytLast[index].state, nbr: allWidgets.ytLast[index].data.nbr, timer: allWidgets.ytLast[index].timer})
        }).then(function() {
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
        }).catch(function(error) {
        });
        if (allWidgets.ytLast[index].data.name == null)
            allWidgets.ytLast[index].data.name = '';
        res.redirect('/settings');
    })

    .post('/updateReddit/:id', urlencodedParser, async function (req, res) {
        let index = req.params.id;
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            reddit: firebase.firestore.FieldValue.arrayRemove({state: allWidgets.reddit[index].state, nbr: allWidgets.reddit[index].data.nbr, sub: allWidgets.reddit[index].data.sub, timer: allWidgets.reddit[index].timer})
        }).then(function() {
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

    .post('/addReddit/', urlencodedParser, async function (req, res) {
        let newReddit = {state: true, data: {sub: req.body.redditId, nbr: req.body.redditNbr}, timer: req.body.redditTimer};
        if (newReddit.data.sub === null) {
            newReddit.data.sub = '';
        }
        allWidgets.reddit.push(newReddit);
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            reddit: firebase.firestore.FieldValue.arrayUnion({state: newReddit.state, nbr: newReddit.data.nbr, sub: newReddit.data.sub, timer: newReddit.timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        res.redirect('/settings');
    })
    .post('/addSteam/', urlencodedParser, async function (req, res) {
        let newSteam = {state: true, data: {id: req.body.id}, timer: req.body.sTimer};
        allWidgets.steam.push(newSteam);
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            steam: firebase.firestore.FieldValue.arrayUnion({state: newSteam.state, id: newSteam.data.id, timer: newSteam.timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        res.redirect('/settings');
    })
    .post('/addWeather/', urlencodedParser, async function (req, res) {
        let newWeather = {state: true, data: {city: req.body.location}, timer: req.body.mTimer};
        allWidgets.meteo.push(newWeather);
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            meteo: firebase.firestore.FieldValue.arrayUnion({state: newWeather.state, city: newWeather.data.city, timer: newWeather.timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        res.redirect('/settings');
    })

    .post('/addYoutubeSub/', urlencodedParser, async function (req, res) {
        let newSub = {state: true, data: {id: req.body.subid}, timer: req.body.subTimer};
        allWidgets.ytSub.push(newSub);
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            ytSub: firebase.firestore.FieldValue.arrayUnion({state: newSub.state, id: newSub.data.id, timer: newSub.timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        res.redirect('/settings');
    })

    .post('/addYoutubeViews/', urlencodedParser, async function (req, res) {
        let newViews = {state: true, data: {id: req.body.vid}, timer: req.body.vTimer};
        allWidgets.ytViews.push(newViews);
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            ytViews: firebase.firestore.FieldValue.arrayUnion({state: newViews.state, id: newViews.data.id, timer: newViews.timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        res.redirect('/settings');
    })

    .post('/addYoutubeLast/', urlencodedParser, async function (req, res) {
        let newLast = {state: true, data: {id: req.body.lid, nbr: req.body.nbr}, timer: req.body.lTimer};
        allWidgets.ytLast.push(newLast);
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            ytLast: firebase.firestore.FieldValue.arrayUnion({state: newLast.state, nbr: newLast.data.nbr, id: newLast.data.id, timer: newLast.timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        res.redirect('/settings');
    })

    .get('/deleteReddit/:id', urlencodedParser, async function (req, res) {
        let index = req.params.id;
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            reddit: firebase.firestore.FieldValue.arrayRemove({state: allWidgets.reddit[index].state, nbr: allWidgets.reddit[index].data.nbr, sub: allWidgets.reddit[index].data.sub, timer: allWidgets.reddit[index].timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        allWidgets.reddit.splice(index, 1);
        res.redirect('/settings');
    })

    .get('/deleteSteam/:id', urlencodedParser, async function (req, res) {
        let index = req.params.id;
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            steam: firebase.firestore.FieldValue.arrayRemove({state: allWidgets.steam[index].state, id: allWidgets.steam[index].data.id, timer: allWidgets.steam[index].timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        allWidgets.steam.splice(index, 1);
        res.redirect('/settings');
    })

    .get('/deleteWeather/:id', urlencodedParser, async function (req, res) {
        let index = req.params.id;
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            meteo: firebase.firestore.FieldValue.arrayRemove({state: allWidgets.meteo[index].state, city: allWidgets.meteo[index].data.city, timer: allWidgets.meteo[index].timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        allWidgets.meteo.splice(index, 1);
        res.redirect('/settings');
    })

    .get('/deleteSubscriber/:id', urlencodedParser, async function (req, res) {
        let index = req.params.id;
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            ytSub: firebase.firestore.FieldValue.arrayRemove({state: allWidgets.ytSub[index].state, id: allWidgets.ytSub[index].data.id, timer: allWidgets.ytSub[index].timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        allWidgets.ytSub.splice(index, 1);
        res.redirect('/settings');
    })

    .get('/deleteViews/:id', urlencodedParser, async function (req, res) {
        let index = req.params.id;
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            ytViews: firebase.firestore.FieldValue.arrayRemove({state: allWidgets.ytViews[index].state, id: allWidgets.ytViews[index].data.id, timer: allWidgets.ytViews[index].timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        allWidgets.ytViews.splice(index, 1);
        res.redirect('/settings');
    })

    .get('/deleteLast/:id', urlencodedParser, async function (req, res) {
        let index = req.params.id;
        db.collection("Users").doc(store.get('user').data.user.uid).update({
            ytLast: firebase.firestore.FieldValue.arrayRemove({state: allWidgets.ytLast[index].state, id: allWidgets.ytLast[index].data.id, nbr: allWidgets.ytLast[index].data.nbr, timer: allWidgets.ytLast[index].timer})
        }).then(function() {
            res.redirect('/settings');
        }).catch(function(error) {
        });
        allWidgets.ytLast.splice(index, 1);
        res.redirect('/settings');
    })


    .use(function(req, res, next){
        res.redirect('/login');
    });

app.listen(process.env.PORT || 8080);