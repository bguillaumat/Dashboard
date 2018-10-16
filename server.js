var express = require('express');
var request = require('request');
var app = express();

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

result = 12;
widget = {meteo: true, etage: result};

app.get('/', function(req, res) {
    res.render("log.ejs");
});

app.get('/test', function (req, res) {
    res.render("main_view.ejs", {widget});
});

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Erreur 404: Page introuvable!');
});

app.listen(8080);