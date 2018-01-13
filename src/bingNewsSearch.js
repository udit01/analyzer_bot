//to be done
'use strict';

let https = require('https');
let subscriptionKey = process.env.BingSearchAPIKey;
let host = 'api.cognitive.microsoft.com';
let path = '/bing/v7.0/news/search';

//set the max number of results
var maxresults=10;

let getNewsData=function(inp,func1){
    
    // console.log('Searching news searches the Web for: ' + inp);
    let request_params = {
        method: 'GET',
        hostname: host,
        path: path + '?q=' + encodeURIComponent(inp),
        headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey,
        }
    };
    let req = https.request(request_params, function(response){
        let body = '';
        response.on('data', function (d) {
            body += d;
        });
        response.on('end', function () {
            var reqJson = JSON.parse(body);
            var finjson = JSON.stringify(reqJson, null, '  ');
            // console.log(finjson);
            var stringCode = "success";

            try{
                var relatedNewsSearchArr = reqJson["value"];
                //what if it doesn't return anything?
                // console.log("Line 37 -----------"+inp);
                
                var numResults = relatedNewsSearchArr.length;
                
                //var relatedNewsSearchMessage = '';
                var newSearchJSON = {};
                newSearchJSON["results"] =[];
                //newSearchJSON["results"]["name"] =[];
                // console.log('was executed');
                var elem = {};
                for(var i=0;(i<numResults && i<=maxresults);i++){
                    // console.log(i);
                    
                    elem = {};

                    elem["name"] = relatedNewsSearchArr[i]["name"];
                    elem["url"] = relatedNewsSearchArr[i]["url"];
                    elem["description"] = relatedNewsSearchArr[i]["description"];

                    try{
                        //relatedNewsSearchMessage += relatedNewsSearchArr[i]["name"]+" " +relatedNewsSearchArr[i]["url"]+"\n\n"+relatedNewsSearchArr[i]["description"]+"\n\n"+"Provider: "+relatedNewsSearchArr[i]["provider"][0]["name"]+ "\n\n"+"---------------------"+ "\n\n";
                        elem["provider"] = relatedNewsSearchArr[i]["provider"][0]["name"];
                        
                    }catch(e){
                        //do nothing ?
                        //relatedNewsSearchMessage += relatedNewsSearchArr[i]["name"]+" " +relatedNewsSearchArr[i]["url"]+"\n\n"+relatedNewsSearchArr[i]["description"]+"\n\n";
                    }
                    newSearchJSON["results"].push(elem);
                }
                // console.log("relatedresults being displayed");
            }catch(e){
                console.log(""+e);
                stringCode = "Couldn't find relevant news";

            }
            // console.log("Line 72 ---for this input it's done:" + inp);
            console.log("----- Line 73:input : "+inp+"& stringCode : "+stringCode);
            func1(newSearchJSON,inp,stringCode);
            
        });
        response.on('error', function (e) {
            console.log(""+ e);
        });

    });
    //req.write(body);
    req.end();
}
module.exports = {
    'getNewsData' : getNewsData
}

//made for debugging
// getNewsData("golden globes",
//     function(enddat,inp,stringcode){
//         console.log(JSON.stringify(enddat, null, '  '));
//     }); 
