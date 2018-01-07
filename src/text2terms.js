import { request } from 'http';

//finding terms from paragraph using text analysis API

let accessKey = process.env.TextAnalyticsAPIkey;

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
let uri = 'westcentralus.api.cognitive.microsoft.com';
let path = '/text/analytics/v2.0/keyPhrases';

let get_terms = function (inp){
	let documents = { 'documents': [
    { 'id': '1', 'language': 'en', 'text': inp }
    ]};
	return get_key_phrases (documents);
}

// let response_handler = function (response, globalvar) {
    // let body = '';
    // response.on ('data', function (d) {
        // body += d;
		// //console.log(""+body);
    // });
    // response.on ('end', function () {
        // let body_ = JSON.parse (body);
		// let body__ = body_['documents'][0]['keyPhrases'];
		// globalvar = body__;
		// // let body__ = JSON.stringify (body_, null, '  ');
		// console.log ("features: "+body__);
    // });
    // response.on ('error', function (e) {
        // console.log ('Error: ' + e.message);
    // });
// };

let get_key_phrases = function (documents) {
    let body = JSON.stringify (documents);
	//console.log("\n\n"+body+"\n\n");
    let request_params = {
        method : 'POST',
        hostname : uri,
        path : path,
        headers : {
            'Ocp-Apim-Subscription-Key' : accessKey,
        }
    };
	var global = null;
	
	// let req = https.request (request_params , response_handler);

    let req = https.request (request_params, function (response) {
		let body = '';
		response.on ('data', function (d) {
			body += d;
			//console.log(""+body);
		});
		response.on ('end', function () {
			let body_ = JSON.parse (body);
			let body__ = body_['documents'][0]['keyPhrases'];
			// let body__ = JSON.stringify (body_, null, '  ');
			console.log ("features: "+body__);
		});
		response.on ('error', function (e) {
			console.log ('Error: ' + e.message);
		});
	});


    req.write (body);
	req.end ();
	// return return1;
}

var a=get_terms("This chapter focuses on Arrays, Objects and Functions. There are a number of useful ECMAScript 5 features which are supported by V8, such as Array.forEach(), Array.indexOf(), Object.keys() and String.trim().");
console.log(a+"");