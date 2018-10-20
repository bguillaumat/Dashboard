let request = require('request');

exports.openweathermeteo = function(city, callback){
    let  url = 'http://api.openweathermap.org/data/2.5/weather?q='+city+'&units=metric&appid=521c8f8246c012c8421856de66e06c2a';

    request(url, function(err, response, body){
        try{
            let result = JSON.parse(body);
            if (result.cod === "404")
                return null;
            let previsions = {
                temperature : result.main.temp,
                icon: result.weather[0].icon,
                state : result.weather[0].main
            };

            callback(null, previsions);
        }catch(e){
            callback(e);
        }
    });
};

exports.askMeteo = function(city) {
    return new Promise(resolve =>
        this.openweathermeteo(city, function(err, previsions){
            if(err) return console.log("This error: ",err);
            if (previsions.temperature != null) {
                resolve(previsions);
            }
            resolve(null);
        })
    )
};