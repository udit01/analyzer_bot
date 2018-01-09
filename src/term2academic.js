'use strict';

let https = require ('https');

// **********************************************
// *** Update or verify the following values. ***
// **********************************************

// Replace the subscriptionKey string value with your valid subscription key.
let subscriptionKey = process.env.AcademicKnowledgeAPIKey;

var numberOfResults = 3;
var word = "Default Word in text2academic.js"
let host = 'westus.api.cognitive.microsoft.com';
let path = '/academic/v1.0/';

let Search = function (query, funcThroughGQ) {
    
	var params2 = 'evaluate?expr=' + encodeURI(query) + "&attributes=Ti,Y,AA.AuN,AA.AuId,E&count="+numberOfResults;
	let request_params = {
        method : 'GET',
        hostname : host,
        path : path + params2,
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
		var stringCode = "success";
		
		if (body_.entities != undefined){
			body_ = body_['entities'];
			for (var i in body_){
				//delete body_[i].logprob;
				delete body_[i].Id;
				body_[i].authors = []
				body_[i].authors.push(body_[i].AA[0].AuN);
				if (body_[i].AA.length>1){
					body_[i].authors.push(body_[i].AA[1].AuN);
				} 
				delete body_[i].AA;
				// delete body_[i].entityPresentationInfo;
				body_[i]["E"] = JSON.parse(body_[i]["E"]);
				if (body_[i]["E"]["S"]!=undefined){
					body_[i]["E"]["S"] = body_[i]["E"]["S"][0]["U"];
				}
				body_[i]["E"]["abstract"] = invAbstractConv(body_[i]["E"]["IA"]);
				delete body_[i]["E"]["IA"];
				body_[i].url = body_[i]["E"]["S"];
				body_[i].abst = body_[i]["E"]["abstract"];
				delete body_[i]["E"];
			}
		}
		else{
			body_ = body_.queryContext;
			stringCode = "acad_api_found_nothing.";
		}
        let body__ = JSON.stringify (body_, null, '  ');
		// console.log (body__);
		funcThroughGQ(body__,word,stringCode);
    });
    response.on ('error', function (e) {
        console.log ("" + e);
    });
}
);
    req.end ();
}

let get_queries = function (inp, funcFromApp) {
	word = inp;
	let params1 = 'interpret?query=' + encodeURI(inp)
    let request_params = {
        method : 'GET',
        hostname : host,
        path : path + params1,
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
		var inp = body_.query;
		//console.log(body_);
		if (body_.interpretations != undefined){
			body_ = body_['interpretations'];
			for (var i in body_){
				//delete body_[i].logprob;
				//delete body_[i].Id;
				// delete body_[i].bingId;
				// delete body_[i].entityPresentationInfo;
				body_[i]= body_[i]["rules"][0]["output"]["value"];
			}
		// }
		// else{
			// body_ = body_.queryContext;
		}

		// var stringCode = "success";
		
        //let body__ = JSON.stringify (body_, null, '  ');
        // console.log (body_);

		if (body_[0] != undefined){
			// console.log(body_[0]);
			Search(body_[0], funcFromApp);
		}
		else{
			// stringCode = "generic";
			Search(qgeneric(inp), funcFromApp);
		}			
    });
    response.on ('error', function (e) {
        console.log ("" + e);
    });
}
);
    req.end ();
}

function qgeneric(inp){
	//var words = inp.split(" ");
	var q = "And("
	var words = inp.split(" ");
	for (var i in words){
		// console.log(words[i]);
		words[i] = "W='"+words[i]+"'";
	}
	q = q + words.join(",") + ")";
	// console.log(q);
	return q;
}

function invAbstractConv(jsondata) {
	if (jsondata!=undefined){
		var size = jsondata.IndexLength;
		var abst = Array(size).fill("");
		var invIndex = jsondata.InvertedIndex;
		for (var key in invIndex){
			//console.log("keys: "+key);
			for (var loc in invIndex[key]){
				abst[invIndex[key][loc]] = key;
				//console.log("key: "+key+" loc: "+loc);
			}
		}
		//console.log(abst+"            this is the array\n");
		return abst.join(' ');
	}
}

//Search ();
// getQueries("quantum mechanics");

module.exports = {
	'get_queries': get_queries,
	'Search': Search
}

