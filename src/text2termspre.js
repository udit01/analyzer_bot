'use strict';

let https = require ('https');

// **********************************************
// *** Update or verify the following values. ***
// **********************************************

// Replace the subscriptionKey string value with your valid subscription key.
let subscriptionKey = '';

let host = 'api.cognitive.microsoft.com';
let path = '/bing/v7.0/entities';

let mkt = 'en-US';
let q = 'two roads diverged';

let params = '?mkt=' + mkt + '&q=' + encodeURI(q);

let response_handler = function (response) {
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
        // console.log (body__);
    });
    response.on ('error', function (e) {
        console.log("" + e);
    });
};

let Search = function () {
    let request_params = {
        method : 'GET',
        hostname : host,
        path : path + params,
        headers : {
            'Ocp-Apim-Subscription-Key' : subscriptionKey,
        }
    };

    let req = https.request (request_params, response_handler);
    req.end ();
}

Search ();