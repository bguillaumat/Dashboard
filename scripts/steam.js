let request = require('request');

exports.steamName = function(id, callback) {
    let url = 'https://store.steampowered.com/api/appdetails?appids='+id;

    request(url, function(err, response, body){
        try{
            let result = JSON.parse(body);
            if (result == null)
                return null;
            callback(null, Object.values(result)[0].data.name);
            callback(null, null);
        }catch(e){
            callback(e);
        }
    });
};

exports.askSteamName = function(id) {
    return new Promise(resolve =>
        this.steamName(id, function(err, gameName){
            if(err) return console.log("This error: ",err);
            if (gameName != null) {
                resolve(gameName);
            }
            resolve(null);
        })
    )
};

exports.steam = function(id, callback){
    let  url = 'http://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v0001/?appid='+id+'&key=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

    request(url, function(err, response, body){
        try{
            let result = JSON.parse(body);
            if (result.response.player_count === "42" || result.response.player_count === "12313450")
                return null;
            callback(null, result.response.player_count);
        }catch(e){
            callback(e);
        }
    });
};

exports.askSteam = function(id) {
    return new Promise(resolve =>
        this.steam(id, function(err, playersNbr){
            if(err) return console.log("This error: ",err);
            if (playersNbr != null) {
                resolve(playersNbr);
            }
            resolve(null);
        })
    )
};