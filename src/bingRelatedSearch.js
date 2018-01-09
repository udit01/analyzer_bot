'use strict';

let https = require('https');
let subscriptionKey = process.env.BingSearchAPIKey;
let host = 'api.cognitive.microsoft.com';
let path = '/bing/v7.0/search';

let getRelatedData=function(inp,func1){
    
    console.log('Searching related searches the Web for: ' + inp);
    let request_params = {
        method: 'GET',
        hostname: host,
        path: path + '?q=' + encodeURIComponent(inp)+'&responseFilter=relatedSearches',
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
            var reqJson = JSON.parse(body);
            var finjson = JSON.stringify(reqJson, null, '  ');
            console.log(finjson);
            try{
                var relatedSearchArr = reqJson["relatedSearches"]["value"];
                var numResults = relatedSearchArr.length;
                console.log(numResults);
                var relatedSearchMessage = '';
                console.log('was executed');
                for(var i=0;i<numResults;i++){
                    console.log(i);
                    try{
                        relatedSearchMessage += relatedSearchArr[i]["displayText"]+ "\n\n";
                    }catch(e){
                        relatedSearchMessage += relatedSearchArr[i]["text"]+"\n\n";
                    }
                }
                console.log("relatedresults being displayed");
                func1(relatedSearchMessage);
            }catch(TypeError){
                func1("cant find related searches");
            }
            
        });
        response.on('error', function (e) {
            console.log('Error: ' + e.message);
        });

    });
    //req.write(body);
    req.end();
}
module.exports = {
    'getRelatedData' : getRelatedData
}

// getRelatedData("narendra modi",
//     function(enddat){
//         console.log(enddat);
//     }); 
