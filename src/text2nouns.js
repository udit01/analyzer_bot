'use strict';

let https = require ('https');

// **********************************************
// *** Update or verify the following values. ***
// **********************************************

// Replace the subscriptionKey string value with your valid subscription key.
let subscriptionKey = process.env.LinguisticsAPIKey;

let host = 'westus.api.cognitive.microsoft.com';
let path = '/linguistics/v1.0/analyze';

let get_nouns = function (inp, func) {
    let request_params = {
        method : 'POST',
        hostname : host,
        path : path,
        headers : {
			"Content-Type" : "application/json", 
            "Ocp-Apim-Subscription-Key" : subscriptionKey
        }
    };
	
	var body = {
			"language" : "en",
			"analyzerIds" : ["22a6b758-420f-4745-8a3c-46835a67c0d2"],
			"text" : inp
	}


    let req = https.request (request_params, function (response) {
    let body = '';
    response.on ('data', function (d) {
        body += d;
    });
    response.on ('end', function () {
        let body_ = JSON.parse (body);
		body_ = body_[0]["result"][0];
		body_ = extractNouns(body_);
        //let body__ = JSON.stringify (body_, null, '  ');
        //console.log (body_);
		//body_ is an array of strings
		func(body_);
    });
    response.on ('error', function (e) {
        console.log (""+ e);
    });
});
	req.write(JSON.stringify(body));
    req.end ();
}

function extractNouns(inp){
	var nouns = []
	var words = inp.split(" ");
	//console.log(words);
	for (var i = 0; i<words.length-1; i++){
		if (words[i].match("^\\(NN")){
			nouns.push(words[i+1]);
		}
	}
	for (var ct in nouns){
		nouns[ct] = nouns[ct].split(")")[0];
	}
	//console.log(nouns);
	return nouns;
}

module.exports = {
		'get_nouns' : get_nouns
}
