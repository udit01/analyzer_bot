'use strict';

let https = require ('https');

// **********************************************
// *** Update or verify the following values. ***
// **********************************************

// Replace the subscriptionKey string value with your valid subscription key.
let subscriptionKey = '';

let host = 'westus.api.cognitive.microsoft.com';
let path = '/academic/v1.0/evaluate';

let q = "Composite(F.FN=='biology')";

let params = '?expr=' + encodeURI(q) + "&attributes=Ti,Y,CC,AA.AuN,AA.AuId";

let response_handler = function (response) {
    let body = '';
    response.on ('data', function (d) {
        body += d;
    });
    response.on ('end', function () {
        let body_ = JSON.parse (body);
		if (body_.entities != undefined){
			body_ = body_['entities'];
			for (var i in body_){
				delete body_[i].logprob;
				delete body_[i].Id;
				// delete body_[i].bingId;
				// delete body_[i].entityPresentationInfo;
				//body_[i]= body_[i]["rules"][0]["output"]["value"];
			}
		// }
		// else{
			// body_ = body_.queryContext;
		}
        let body__ = JSON.stringify (body_, null, '  ');
        console.log (body__);
    });
    response.on ('error', function (e) {
        console.log ('Error: ' + e.message);
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