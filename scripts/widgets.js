let weather = require('./weather');
let steam = require('./steam');
let yt = require('./youtube');
let reddit = require('./reddit');

exports.meteo = async function (widget) {
    let prevision = await weather.askMeteo(widget.data.city);
    if (prevision != null) {
        widget.data.icon = prevision.icon;
        widget.data.temp = prevision.temperature;
        widget.data.state = prevision.state;
    }
    else
        widget.data.temp = null;
};

exports.steam = async function (widget) {
    widget.data.name = await steam.askSteamName(widget.data.id);
    widget.data.players = await steam.askSteam(widget.data.id, widget.data.name);
};

exports.ytSubs = async function (widget) {
    let data = await yt.askChannel(widget.data.id);
    if (data) {
        widget.data.name = data.name;
        widget.data.subs = data.subs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    else
        widget.data.subs = null;
};

exports.ytViews = async function (widget) {
    let data = await yt.askViews(widget.data.id);
    if (data) {
        widget.data.name = data.name;
        widget.data.views = data.views.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    else
        widget.data.views = null;
};

exports.ytLast = async function (widget) {
    let data = await yt.askViews(widget.data.id);
    widget.data.comments = await yt.askComments(widget.data.id, widget.data.nbr);
    if (data)
        widget.data.name = data.name;
    else
        widget.data.name = '';
};

exports.reddit = async function (widget) {
    widget.data.posts = await reddit.askReddit(widget.data.sub, widget.data.nbr);
};