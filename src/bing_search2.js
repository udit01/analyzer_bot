//finding the search json
//WASTE
//WASTE
//WASTE
var accessKey = process.env.BingSearchAPIkey;

'use strict';

let https = require ('https');

// **********************************************
// *** Update or verify the following values. ***
// **********************************************

// Replace or verify the region.

// You must use the same region in your REST API call as you used to obtain your access keys.
// For example, if you obtained your access keys from the westus region, replace 
// "westcentralus" in the URI below with "westus".

// NOTE: Free trial access keys are generated in the westcentralus region, so if you are using
// a free trial access key, you should not need to change this region.
let uri = 'api.cognitive.microsoft.com';
let path = '/bing/v7.0/search';

let get_terms = function (inp, func1){
	
	let documents = { 'documents': [
    { 'id': '1', 'language': 'en', 'text': inp }
    ]};
	return get_key_phrases (documents, func1);
}


let get_key_phrases = function (documents, func) {
	
    let body = JSON.stringify (documents);
	// console.log("json\n\n"+body+"\n\n");
    let request_params = {
        method : 'POST',
        hostname : uri,
        path : path,
        headers : {
            'Ocp-Apim-Subscription-Key' : accessKey,
        }
    };

    let req = https.request (request_params, function (response) {
		let body = '';
		response.on ('data', function (d) {
			body += d;
		});
		response.on ('end', function () {
			let body_ = JSON.parse (body);
			let body__ = body_['documents'][0]['keyPhrases'];
			// let body___ = JSON.stringify (body__, null, '  ');
			func(body__);
		});
		response.on ('error', function (e) {
			console.log ('Error: ' + e.message);
		});
	});


    req.write (body);
	req.end ();
}


module.exports = {
		'get_terms' : get_terms,
		'get_key_phrases' : get_key_phrases
}













