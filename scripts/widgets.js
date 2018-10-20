let weather = require('./weather');

exports.meteo = async function (widget) {
    let prevision = await weather.askMeteo(widget.meteo.data.city);
    console.log(prevision);
    if (prevision != null) {
        widget.meteo.data.icon = prevision.icon;
        widget.meteo.data.temp = prevision.temperature;
        widget.meteo.data.state = prevision.state;
    }
    else
        widget.meteo.data.temp = null;
};