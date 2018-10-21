let request = require('request');

exports.getLastSub = function(sub, nbr, callback){
    let  url = 'https://www.reddit.com/r/'+sub+'/new/.json?count='+nbr;

    request(url, function(err, response, body){
        try{
            let result = JSON.parse(body);
            console.log(result.data.children);
            let posts = [];
            for (let i = 0; i < nbr; ++i) {
                if (result.data.children[i].data.title != null) {
                    posts.push({title: result.data.children[i].data.title, thumbnail: result.data.children[i].data.thumbnail, author: result.data.children[i].data.author, link: result.data.children[i].data.permalink});
                }
            }
            callback(null, posts);
        }catch(e){
            callback(e);
        }
    });
};


exports.askReddit = function(sub, nbr) {
    return new Promise(resolve =>
        this.getLastSub(sub, nbr, function(err, post){
            if(err) return console.log("This error: ",err);
            if (post != null) {
                resolve(post);
            }
            resolve(null);
        })
    )
};