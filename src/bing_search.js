'use strict';

let https = require('https');

// **********************************************
// *** Update or verify the following values. ***
// **********************************************

// Replace the subscriptionKey string value with your valid subscription key.
let subscriptionKey = '';
// process.env.BingSearchAPIkey;

// Verify the endpoint URI.  At this writing, only one endpoint is used for Bing
// search APIs.  In the future, regional endpoints may be available.  If you
// encounter unexpected authorization errors, double-check this host against
// the endpoint for your Bing Web search instance in your Azure dashboard.
let host = 'api.cognitive.microsoft.com';
let path = '/bing/v7.0/search';

//let term = 'Narendra Modi';

//var data = null;

let getData = function(inp, func1){
    console.log('Searching the Web for: ' + inp);

let response_handler = function (response) {
    let body = '';
    response.on('data', function (d) {
        console.log("when was this executed");
        body += d;
    });
    response.on('end', function () {
        // console.log('\nRelevant Headers:\n');
        // for (var header in response.headers)
        //     // header keys are lower-cased by Node.js
        //     if (header.startsWith("bingapis-") || header.startsWith("x-msedge-"))
        //         console.log(header + ": " + response.headers[header]);
        console.log("step2")
        data = JSON.parse(body);
        body = JSON.stringify(data, null, '  ');
        console.log("dekho toh");
        console.log(data);
        console.log("data was block ke andar");
        console.log(typeof data);
        console.log(data._type);
        console.log("end");
         //return data;
        //console.log('\nJSON Response:\n');
        //console.log(body);
    });
    response.on('error', function (e) {
        console.log('Error: ' + e.message);
    });
};

let bing_web_search = function (search) {
     console.log('Searching the Web for: ' + term);
    let request_params = {
        method: 'GET',
        hostname: host,
        path: path + '?q=' + encodeURIComponent(inp),
        headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey,
        }
    };
    let req = https.request(request_params, function(inp,func1){
        let body = '';
        response.on('data', function (d) {
            body += d;
        });
        response.on('end', function () {
            data = JSON.parse(body);
            body = JSON.stringify(data, null, '  ');
            func1(body);
        });
        response.on('error', function (e) {
            console.log('Error: ' + e.message);
        });

    });
    req.write(body);
    req.end();
}
module.exports = {
    'getData' : getData
}

// let response_handler = function (response) {
//     let body = '';
//     response.on('data', function (d) {
//         // console.log("when was this executed");
//         body += d;
//     });
//     response.on('end', function () {
//         // console.log('\nRelevant Headers:\n');
//         // for (var header in response.headers)
//         //     // header keys are lower-cased by Node.js
//         //     if (header.startsWith("bingapis-") || header.startsWith("x-msedge-"))
//         //         console.log(header + ": " + response.headers[header]);
//         //console.log("step2")
//         data = JSON.parse(body);
//         body = JSON.stringify(data, null, '  ');
//         // console.log("dekho toh");
//         // console.log(data);
//         // console.log("data was block ke andar");
//         // console.log(typeof data);
//         //  console.log(data._type);
//         //  console.log("end");
//          //return data;
//         //console.log('\nJSON Response:\n');
//         //console.log(body);
//     });
//     response.on('error', function (e) {
//         console.log('Error: ' + e.message);
//     });
// };

// let bing_web_search = function (search) {
//      console.log('Searching the Web for: ' + term);
//     let request_params = {
//         method: 'GET',
//         hostname: host,
//         path: path + '?q=' + encodeURIComponent(search),
//         headers: {
//             'Ocp-Apim-Subscription-Key': subscriptionKey,
//         }
//     };

//     let req = https.request(request_params, response_handler);
//     req.end();
//     console.log("when was this executed buddy");
//  }

// if (subscriptionKey.length === 32) {
//     // console.log("step 1")
//     bing_web_search(term);
//     // console.log("step 3");
//     // console.log("data was");
//     // console.log(typeof data);
//     // console.log(data._type);
//     // console.log(data["_type"]);
//     // if(data.hasOwnProperty("entities")){
//     //     console.log("enti");
//     // }
// } else {
//     console.log('Invalid Bing Search API subscription key!');
//     console.log('Please paste yours into the source code.');
// }
// console.log("this was dekhte hai");

// function termToDescription(term){
		
// }
// function termToLinks(term){

// }
