let request = require('request');

exports.steamName = function(id, callback) {
    let url = 'https://store.steampowered.com/api/appdetails?appids='+id;

    request(url, function(err, response, body){
        try{
            if (body.startsWith("<HTML>"))
                callback(null, null);
            if (body) {
                let result = JSON.parse(body);
                if (result == null)
                    callback(null, null);
                else
                    callback(null, Object.values(result)[0].data.name);
            }
        }catch(e){
            callback("This: ", e);
        }
    });
};

exports.askSteamName = function(id) {
    return new Promise(resolve =>
        this.steamName(id, function(err, gameName){
            if(err) resolve(null);
            if (gameName != null) {
                resolve(gameName);
            }
            resolve(null);
        })
    )
};

exports.steam = function(id, name, callback){
    let  url = 'http://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v0001/?appid='+id+'&key=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

    request(url, function(err, response, body){
        try{
            if (body) {
                let result = JSON.parse(body);
                if (name == null)
                    callback(null, null);
                callback(null, result.response.player_count);
            }
        }catch(e){
            callback(e);
        }
    });
};

exports.askSteam = function(id, name) {
    return new Promise(resolve =>
        this.steam(id, name, function(err, playersNbr){
            if(err) return console.log("This error: ",err);
            if (playersNbr != null) {
                resolve(playersNbr);
            }
            resolve(null);
        })
    )
};