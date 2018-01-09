//given a term, find its name, url, image, description (if it exists).

'use strict';

let https = require ('https');

// **********************************************
// *** Update or verify the following values. ***
// **********************************************

// Replace the subscriptionKey string value with your valid subscription key.
var subscriptionKey = process.env.BingEntitySearchAPIKey;

let host = 'api.cognitive.microsoft.com';
let path = '/bing/v7.0/entities';

let mkt = 'en-US';
let q = 'server';

let word = "Default in term2info.js";

let get_info = function (inp, func1) {
    let params = '?mkt=' + mkt + '&q=' + encodeURI(inp);
    word = inp;
	return entity_search(params, func1);
}

let entity_search = function (args, func) {
    let request_params = {
        method : 'GET',
        hostname : host,
        path : path + args,
        headers : {
            'Ocp-Apim-Subscription-Key' : subscriptionKey,
        }
    };

    let req = https.request (request_params, function (response) {
        
        let body = '';
        response.on ('data', function (d) {
            body += d;
        });

        response.on ('end', function () {
            let body_ = JSON.parse (body);
            if (body_.entities != undefined && body_.entities.value != undefined){
                body_ = body_['entities']['value'];
                for (var i in body_){
                    delete body_[i].contractualRules;
                    delete body_[i].webSearchUrl;
                    delete body_[i].bingId;
                    delete body_[i].entityPresentationInfo;
                    body_[i]["image"] = body_[i]["image"]["hostPageUrl"];
                }
            }
            else{
                body_ = body_.queryContext;
            }
            let body__ = JSON.stringify (body_, null, '  ');
            //cleaning up data from json & handling exceptions here.		
            
            console.log (body__);
            func(word,body__);
        });

        response.on ('error', function (e) {
            console.log ('Error: ' + e.message);
        });
    });
    req.end ();
}
