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

let get_info = function (inp, func1) {
	let params = '?mkt=' + mkt + '&q=' + encodeURI(inp);
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
        let body__ = JSON.stringify (body_, null, '  ');
        //cleaning up data from json & handling exceptions here.		
		
		console.log (body__);
		func(body__);
    });
    response.on ('error', function (e) {
        console.log ('Error: ' + e.message);
    });
};);
    req.end ();
}
