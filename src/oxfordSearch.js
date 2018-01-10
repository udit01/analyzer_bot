'use strict';

let https = require('https');
let app_id = process.env.OXFORDAPPID;
let app_key = process.env.OXFORDAPPKEY;
// let host = 'od-api.oxforddictionaries.com/api/v1';
let pathFinal = '/api/v1/entries/en';
let pathFindRoot = "/api/v1/inflections/en";

//set the max number of results
//var maxresults=10;

//this function fill get the root word then the whole data
let get_meaning = function (inp, func1) {

    // console.log('Searching oxford searches the Web for: ' + inp);
    let request_params = {
        method: 'GET',
        hostname: "od-api.oxforddictionaries.com",
        path: pathFindRoot + '/' + encodeURI(inp),
        headers: {
            "Accept": "application/json",
            "app_id": app_id,
            "app_key": app_key
        }
    };
    // console.log("lets see");
    let req = https.request(request_params, function (response) {
        let body = '';
        response.on('data', function (d) {
            body += d;
        });
        response.on('end', function () {
            try{
                var reqJson = JSON.parse(body);
				var rootWord = "";
				//extract the keyword here 
				// [0] because all are arrays
				var lexEntryVal = reqJson['results'][0]['lexicalEntries'][0];
				// console.log(JSON.stringify(reqJson));
				// console.log("Line 44:" +JSON.stringify(reqJson['results']));
				rootWord = lexEntryVal['inflectionOf'][0]['id'] ;
					//or can use 'word'

					}
            catch(e){
                rootWord = inp;
                console.log(""+e);
            }
            
            getOxfordData(rootWord,func1);                

        });
        response.on('error', function (e) {
            console.log("" + e);
        });

    });
    //req.write(body);
    req.end();
}

let getOxfordData=function(inp,funcThoughRoot){
    
    let request_params = {
        method: 'GET',
        hostname: "od-api.oxforddictionaries.com",
        path: pathFinal +'/'+ encodeURI(inp),
        headers: {
            "Accept": "application/json",
            "app_id": app_id,
            "app_key": app_key
        }
    };
    // console.log("lets see");
    let req = https.request(request_params, function(response){
        let body = '';
        // console.log("dekho bhai");
        response.on('data', function (d) {
            body += d;
        });
        response.on('end', function () {
            // console.log("---this is"+body);
            var findata = "";
            var stringCode = "success";

            try{
                var reqJson = JSON.parse(body);

                var finjson = JSON.stringify(reqJson, null, '  ');
                // console.log(finjson);
                // console.log("Root detected LINE87: "+inp);
                var lexicalentries = reqJson["results"][0]["lexicalEntries"];
                var lengthlexicalentries = lexicalentries.length;
                var oxJSON = {};
                oxJSON["types"] = [];
                
                //
                for(var i=0;i<lengthlexicalentries;i++){
                    var lexicalcategory = lexicalentries[i]["lexicalCategory"];
                    oxJSON["types"][i] = {};
                    oxJSON["types"][i]["lexicalCategory"] = lexicalentries[i]["lexicalCategory"];
                    //findata += "Lexical Category: "  + lexicalcategory+ "\n\n";
                    // console.log("lexcat was "+i);
                    var entries = lexicalentries[i]["entries"];
                    var numentries = entries.length;
                    var numdef =0;
                    oxJSON["types"][i]["diffDefinitions"] = [];
                    for(var j=0;j<numentries;j++){
                        var thisentry = entries[j];
                        var sensesarr = thisentry["senses"];
                        var numsenses = sensesarr.length;
                        
                        for(var k=0;k<numsenses;k++){
                            var thissense = sensesarr[k];
                            try{
                                var definition = thissense["definitions"][0];
                                numdef++;
                                oxJSON["types"][i]["diffDefinitions"][numdef-1] = {};
                                oxJSON["types"][i]["diffDefinitions"][numdef-1]["definition"] =  thissense["definitions"][0];
                               // findata += "Definition "+numdef+": "+definition +"\n\n";
                                try{
                                    var examples= thissense["examples"][0]["text"];
                                    oxJSON["types"][i]["diffDefinitions"][numdef-1]["example"] = thissense["examples"][0]["text"];
                                    //findata += "Example: "+ examples + "\n\n";
                                }catch(e){
                                    // console.log("cant find example");
                                    //findata += "\n";

                                }
                            }catch(e){
                                console.log(""+e);
                                stringCode = "Defination not found for" + inp;
                            }
                            
                            
                        }
                    }
                    //findata+= "----------------------"+"\n\n";
                }
            }
            catch(e){
                console.log(""+e);
                stringCode = "Coundn't find meaning on API CALL or response was HTML";
            }

            funcThoughRoot(oxJSON,inp,stringCode);
            
        });
        response.on('error', function (e) {
            console.log(""+e);
        });

    });
    //req.write(body);
    req.end();
}
module.exports = {
    'getOxfordData' : getOxfordData,
    'get_meaning': get_meaning
}

//made for debugging
