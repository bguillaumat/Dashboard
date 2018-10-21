let request = require('request');

exports.openweathermeteo = function(city, callback){
    let  url = 'http://api.openweathermap.org/data/2.5/weather?q='+city+'&units=metric&appid=ecacbaa661cb5c871a7ea2022272dc5b';

    request(url, function(err, response, body){
        try{
            if (body) {
                let result = JSON.parse(body);
                if (result.cod == "404" || result.cod == "401")
                    callback(null, null);
                else {
                    let previsions = {
                        temperature: result.main.temp,
                        icon: result.weather[0].icon,
                        state: result.weather[0].main
                    };
                    callback(null, previsions);
                }
            }
        }catch(e){
            callback(e);
        }
    });
};

exports.askMeteo = function(city) {
    return new Promise(resolve =>
        this.openweathermeteo(city, function(err, previsions){
            if(err) return console.log("This error: ",err);
            if (previsions != null) {
                resolve(previsions);
            }
            resolve(null);
        })
    )
};