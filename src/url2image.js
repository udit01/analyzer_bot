//finding terms from paragraph using text analysis API

var accessKey = process.env.VISIONAPIKEY;

'use strict';

let https = require ('https');

// **********************************************
// *** Update or verify the following values. ***
// **********************************************

// Replace or verify the region.
// https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/ocr?
// You must use the same region in your REST API call as you used to obtain your access keys.
// For example, if you obtained your access keys from the westus region, replace 
// "westcentralus" in the URI below with "westus".

// NOTE: Free trial access keys are generated in the westcentralus region, so if you are using
// a free trial access key, you should not need to change this region.
let uri = 'westcentralus.api.cognitive.microsoft.com/vision/v1.0';
let path = '/vision/v1.0/ocr';

let getImageData = function (inp, func1){
	
	// let documents = { 'documents': [
    // { 'id': '1', 'language': 'en', 'text': inp }
    // ]};
    let documents = { 'url': inp};
	return getRealData (documents, func1);
}


let getRealData = function (documents, func) {
	
    let body = JSON.stringify (documents);
	// console.log("json\n\n"+body+"\n\n");
    let request_params = {
        method : 'POST',
        hostname : "westcentralus.api.cognitive.microsoft.com",
        path : path ,
        headers : {
            'Ocp-Apim-Subscription-Key' : accessKey,
            'Content-Type':"application/json"
        }
    };

    let req = https.request (request_params, function (response) {
		let body = '';
		response.on ('data', function (d) {
			body += d;
		});
		response.on ('end', function () {
			let findata = JSON.parse (body);
			//let body__ = body_['documents'][0]['keyPhrases'];
             //let body1 = JSON.stringify (body, null, '  ');
            var finmessage = "";
            var imJSON = {};
            imJSON["regions"]= [];
            try{
                var regionsarr = findata["regions"]
                var numregions = regionsarr.length;
                for(var i=0;i<numregions;i++){
                    var thisregion = regionsarr[i];
                    var linearr = thisregion["lines"];
                    var numlinearr = linearr.length;
                    imJSON["regions"][i]={};
                    imJSON["regions"][i]["lines"] = [];
                    for(var j=0;j<numlinearr;j++){
                        var thisline =linearr[j];
                        var wordarr = thisline["words"];
                        var thislinestring = "";
                        var numwords = wordarr.length;
                        for(var k=0;k<numwords;k++){
                            finmessage += wordarr[k]["text"] +" ";
                            thislinestring += wordarr[k]["text"]+" ";
                            imJSON["regions"][i]["lines"][j]= thislinestring;
                        }
                        finmessage += "\n\n";

                    }
                    finmessage += "---------------------------"+ "\n\n";
                }
            }catch(e){
                finmessage = "Some error, try again later";
            }
               
			func(imJSON, finmessage);
		});
		response.on ('error', function (e) {
			console.log("" + e);
		});
	});


    req.write (body);
	req.end ();
}


module.exports = {
		'getImageData' : getImageData
}

getImageData("http://bsw.iitd.ac.in/temp/textwaaliimg.JPG",
    function(endJSON, endtext){
        console.log(JSON.stringify(endJSON, null, '  '));
        console.log(endtext);
    }); 












