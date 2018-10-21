let weather = require('./weather');
let steam = require('./steam');
let yt = require('./youtube');
let reddit = require('./reddit');

exports.meteo = async function (widget) {
    let prevision = await weather.askMeteo(widget.meteo.data.city);
    if (prevision != null) {
        widget.meteo.data.icon = prevision.icon;
        widget.meteo.data.temp = prevision.temperature;
        widget.meteo.data.state = prevision.state;
    }
    else
        widget.meteo.data.temp = null;
};

exports.steam = async function (widget) {
    widget.steam.data.name = await steam.askSteamName(widget.steam.data.id);
    widget.steam.data.players = await steam.askSteam(widget.steam.data.id, widget.steam.data.name);
};

exports.ytSubs = async function (widget) {
    let data = await yt.askChannel(widget.ytSub.data.id);
    if (data) {
        widget.ytSub.data.name = data.name;
        widget.ytSub.data.subs = data.subs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    else
        widget.ytSub.data.subs = null;
};

exports.ytViews = async function (widget) {
    let data = await yt.askViews(widget.ytViews.data.id);
    if (data) {
        widget.ytViews.data.name = data.name;
        widget.ytViews.data.views = data.views.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    else
        widget.ytViews.data.views = null;
};

exports.ytLast = async function (widget) {
    let data = await yt.askViews(widget.ytLast.data.id);
    widget.ytLast.data.comments = await yt.askComments(widget.ytLast.data.id, widget.ytLast.data.nbr);
    widget.ytLast.data.name = data.name;
};

exports.reddit = async function (widget) {
    widget.reddit.data.posts = await reddit.askReddit(widget.reddit.data.sub, widget.reddit.data.nbr);
};