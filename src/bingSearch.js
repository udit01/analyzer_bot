'use strict';

let https = require('https');
let subscriptionKey = process.env.BingSearchAPIKey;
let host = 'api.cognitive.microsoft.com';
let path = '/bing/v7.0/search';

let getData=function(inp,func1){
    
    // console.log('Searching the Web for: ' + inp);
    let request_params = {
        method: 'GET',
        hostname: host,
        path: path + '?q=' + encodeURIComponent(inp),
        headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey,
        }
    };
    let req = https.request(request_params, function(response){
        let body = '';
        response.on('data', function (d) {
            body += d;
        });
        response.on('end', function () {
            //data = JSON.parse(body);
            var reqJson = JSON.parse(body);
            //body = JSON.stringify(reqJson, null, '  ');
            //console.log(body);
            // if(reqJson.hasOwnProperty("entities")){
            //     func1(reqJson["entities"]["value"][0]["description"]);
            // }
            try{
                // console.log("trying entitysearch");
                var entityMessage = reqJson["entities"]["value"][0]["description"]+ "\n\n"+reqJson["entities"]["value"][0]["name"]+"\n\n"+reqJson["entities"]["value"][0]["url"];
                // console.log("entitymesssage being displayed");
                func1(entityMessage);
            }catch(TypeError){
                try{
                    //var alternateMessage="";
                    var alternateMessage = reqJson["webPages"]["value"][0]["snippet"] + "\n\n"+reqJson["webPages"]["value"][0]["name"]+"\n\n"+reqJson["webPages"]["value"][0]["url"];
                    //alter
                    // console.log("alternatemessage being displayed");
                    func1(alternateMessage);
                }catch(e){
                    func1("no result found");
                }
                
            }
            
        });
        response.on('error', function (e) {
            console.log(""+ e);
        });

    });
    //req.write(body);
    req.end();
}
module.exports = {
    'getData' : getData
}