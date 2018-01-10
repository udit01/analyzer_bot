'use strict';

let https = require('https');
let app_id = process.env.OXFORDAPPID;
let app_key = process.env.OXFORDAPPKEY;
//let host = 'od-api.oxforddictionaries.com/api/v1';
let path = '/api/v1/entries/en';

//set the max number of results
//var maxresults=10;

let getOxfordData=function(inp,func1){
    
    // console.log('Searching oxford searches the Web for: ' + inp);
    let request_params = {
        method: 'GET',
        hostname: "od-api.oxforddictionaries.com",
        path: path +'/'+ encodeURI(inp),
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
            var reqJson = JSON.parse(body);
            var finjson = JSON.stringify(reqJson, null, '  ');
            // console.log(finjson);
            var lexicalentries = reqJson["results"][0]["lexicalEntries"];
            var lengthlexicalentries = lexicalentries.length;
            var findata = "";
            var stringCode = "success";

            //
            for(var i=0;i<lengthlexicalentries;i++){
                var lexicalcategory = lexicalentries[i]["lexicalCategory"];
                findata += "Lexical Category: "  + lexicalcategory+ "\n\n";
                // console.log("lexcat was "+i);
                var entries = lexicalentries[i]["entries"];
                var numentries = entries.length;
                var numdef =0;
                for(var j=0;j<numentries;j++){
                    var thisentry = entries[j];
                    var sensesarr = thisentry["senses"];
                    var numsenses = sensesarr.length;
                    
                    for(var k=0;k<numsenses;k++){
                        var thissense = sensesarr[k];
                        try{
                            var definition = thissense["definitions"][0];
                            numdef++;
                            findata += "Definition "+numdef+": "+definition +"\n\n";
                            try{
                                var examples= thissense["examples"][0]["text"];
                                findata += "Example: "+ examples + "\n\n";
                            }catch(e){
                                // console.log("cant find example");
                                findata += "\n";

                            }
                        }catch(e){
                            console.log(""+e);
                            stringCode = "Defination not found for" + inp;
                        }
                        
                        
                    }
                }
                findata+= "----------------------"+"\n\n";
            }

            func1(findata,inp,stringCode);
            
        });
        response.on('error', function (e) {
            console.log(""+e);
        });

    });
    //req.write(body);
    req.end();
}
module.exports = {
    'getOxfordData' : getOxfordData
}

//made for debugging
// getOxfordData("set",
//     function(enddat){
//         console.log(enddat);
//     }); 
