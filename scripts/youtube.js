let request = require('request');

exports.comments = function(id, nbr, callback) {
    let url = 'https://www.googleapis.com/youtube/v3/commentThreads?videoId='+id+'&part=snippet&key=AIzaSyDFIcAyVXCF1uw_xBDUAbr-OuyhQCnZiic&maxResults='+nbr;

    request(url, function(err, response, body){
        try{
            if (body) {
                let result = JSON.parse(body);
                if (result.error)
                    callback(null, null);
                else {
                    let comments = [];
                    let x = 0;
                    while (result.items[x]) {
                        comments.push(result.items[x].snippet.topLevelComment.snippet.textOriginal);
                        x++;
                    }
                    callback(null, comments);
                }
            }
        }catch(e){
            callback(e);
        }
    });
};

exports.askComments = function(id, nbr) {
    return new Promise(resolve =>
        this.comments(id, nbr, function(err, data){
            if(err) return console.log("This error: ",err);
            if (data != null) {
                resolve(data);
            }
            resolve(null);
        })
    )
};

exports.view = function(id, callback) {
    let url = 'https://www.googleapis.com/youtube/v3/videos?id='+id+'&key=AIzaSyDFIcAyVXCF1uw_xBDUAbr-OuyhQCnZiic&part=statistics,snippet';

    request(url, function(err, response, body){
        try{
            if (body) {
                let result = JSON.parse(body);
                if (result.pageInfo.totalResults === 0)
                    callback(null, null);
                let data = {
                    name: result.items[0].snippet.title,
                    views: result.items[0].statistics.viewCount
                };
                callback(null, data);
            }
        }catch(e){
            callback(e);
        }
    });
};

exports.askViews = function(id) {
    return new Promise(resolve =>
        this.view(id, function(err, data){
            if(err) return console.log("This error: ",err);
            if (data != null) {
                resolve(data);
            }
            resolve(null);
        })
    )
};

exports.channel = function(id, callback){
    let  url = 'https://www.googleapis.com/youtube/v3/channels?part=statistics,contentDetails,snippet&id='+id+'&key=AIzaSyDFIcAyVXCF1uw_xBDUAbr-OuyhQCnZiic';

    request(url, function(err, response, body){
        try{
            if (body) {
                let result = JSON.parse(body);
                if (id === '' || result.hasOwnProperty('error'))
                    callback(null, null);
                if (result.pageInfo.totalResults === 0)
                    callback(null, null);
                if (typeof result.items !== "undefined" && result.items != null && result.items.length != null && result.items > 0) {
                    let data = {
                        name: result.items[0].snippet.title,
                        subs: result.items[0].statistics.subscriberCount
                    };
                    callback(null, data);
                } else
                    callback(null, null);
            }
        }catch(e){
            callback(e);
        }
    });
};

exports.askChannel = function(id) {
    return new Promise(resolve =>
        this.channel(id, function(err, data){
            if(err) return console.log("This error: ",err);
            if (data != null) {
                resolve(data);
            }
            resolve(null);
        })
    )
};