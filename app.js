'use strict';

let https = require('https');

// **********************************************
// *** Update or verify the following values. ***
// **********************************************

// Replace the subscriptionKey string value with your valid subscription key.
let subscriptionKey = '8a6bfd27c4c54577b0ed73d688f2c801';

// Verify the endpoint URI.  At this writing, only one endpoint is used for Bing
// search APIs.  In the future, regional endpoints may be available.  If you
// encounter unexpected authorization errors, double-check this host against
// the endpoint for your Bing Web search instance in your Azure dashboard.
let host = 'api.cognitive.microsoft.com';
let path = '/bing/v7.0/search';

let term = 'Microsoft Cognitive Services';

let response_handler = function (response) {
    let body = '';
    response.on('data', function (d) {
        body += d;
    });
    response.on('end', function () {
        console.log('\nRelevant Headers:\n');
        for (var header in response.headers)
            // header keys are lower-cased by Node.js
            if (header.startsWith("bingapis-") || header.startsWith("x-msedge-"))
                 console.log(header + ": " + response.headers[header]);
        body = JSON.stringify(JSON.parse(body), null, '  ');
        console.log('\nJSON Response:\n');
        console.log(body);
    });
    response.on('error', function (e) {
        console.log('Error: ' + e.message);
    });
};

let bing_web_search = function (search) {
  console.log('Searching the Web for: ' + term);
  let request_params = {
        method : 'GET',
        hostname : host,
        path : path + '?q=' + encodeURIComponent(search),
        headers : {
            'Ocp-Apim-Subscription-Key' : subscriptionKey,
        }
    };

    let req = https.request(request_params, response_handler);
    req.end();
}

if (subscriptionKey.length === 32) {
    bing_web_search(term);
} else {
    console.log('Invalid Bing Search API subscription key!');
    console.log('Please paste yours into the source code.');
}

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';
const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })

//CUSTOM ENV VARIABLES:
var surveyFormUrl = process.env.FormURL;

// .matches('Greeting', (session) => {
//     session.send('You reached Greeting intent, you said \'%s\'.', session.message.text);
// })
// .matches('Help', (session) => {
//     session.send('You reached Help intent, you said \'%s\'.', session.message.text);
// })
// .matches('Cancel', (session) => {
//     session.send('You reached Cancel intent, you said \'%s\'.', session.message.text);
// })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
// .onDefault((session) => {
//     session.send('Sorry, I did not understand \'%s\'.', session.message.text);
// });



bot.dialog('/', intents);   
intents.matches('Greeting', '/greeting');
intents.matches('Help', '/help');
// intents.matches('Main', '/main');
intents.matches('Exit', '/exit');
intents.matches('More', '/more');//difficult ?
// intents.matches('Reminder', '/reminder'); // to set remider after 1 day or something
intents.matches('None', '/main')
// different than campus bot
intents.onDefault((session) => {//for NONE
    // DO SOMETHING RANDOM HERE ----------------------------------------LIKE THOUGHTFUL THINGS OR QUOTES ETC ---------------------  
    session.send('This is the default intent \'%s\'.', session.message.text);
});


var introMessage = ['I help to find relevant information both current and all-time\n Get results Relevant to academica, general definations and more ',
    'Deveoped by :-\n Udit Jain, Soumya Sharma, Akshat Khare.'
];


bot.dialog('/greeting', [
    // function (session, args, next) {
    //      builder.Prompts.text(session, 'Hello there! I am analyzer bot ');
    // },
    function (session, results) {
        session.send('Hello there! I am analyzer bot and  ');
        // session.replaceDialog('/main');
        session.endDialog();
    }
]);



bot.dialog('/exit', [
    function (session, results) {
        session.send('Thank you! Hope You enjoyed our services! Please come again!\n Meanwhile you can fill this optional survey to help us serve you better');
        session.send(surveyFormUrl);
        session.endConversation();
    }
]);

bot.dialog('/main', [
    function (session, args, next) {
        //check for the user-data completeness here
        builder.Prompts.choice(session, "What would you like search results about \n(type end to quit)?", "Proper Noun\n<Entities>| Current info\n<News>|People also search for\n<Recommendations>|Scientific Papers\n<Academica>| Term-Defination | Help");
        
        // idk why the below function call is required
        // next();
    },
    function (session, args, next) {
        term = args;
		session.send(bing_web_search(term));
    },
    function (session, results) {
        if (results.response) {
            
            session.send(results.response.entity);
            
            if (results.response.entity === 'Exit') {
                
                session.endDialog("You can chat again by saying Hi");
            }
            else {
                session.send('Hey! you are in the main intent! function 3');                
            }
        }
        else {
            session.endDialog("Invalid Response. You can call again by saying Hi");
        }
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        // session.replaceDialog('/main');
        session.endDialog();
    }
]);

bot.dialog('/help', [
    function (session) {
        var introCard = new builder.HeroCard(session)
            .title("Analyzer Bot")
            .text("Increasing your productivity")
            .images([
                builder.CardImage.create(session, "https://blog.growthexp.com/wp-content/uploads/2017/08/Analytics.jpg")
            ]);
        var msg = new builder.Message(session).attachments([introCard]);
        session.send(msg);
        introMessage.forEach(function (ms) {
            session.send(ms);
        });
        session.endDialog();
    }
]);


// bot.dialog('/none', [
//     function (session) {
//         session.send('You are in None intent and after this, session.endDialogue will be called.');
//         session.endDialog();
//     }
// ]);

// bot.dialog('/repeat', [
//     function (session, args, next) {
        
//         var text_dict = findAllFromName(args.entities,'repeat-text');

//         // console.log("----------------------Line 205 " + args);
       
//         //want to test this but too dificult ?
//         // console.log("------------------------------LINE 207 " + ((cancel_dict != null) || (cancel_dict) || (cancel_dict.length != 0)) )
     
        
//         // try{
//         //     text_dict = builder.EntityRecognizer.findAllEntities(args.entities,'repeat-text');
//         // }
//         // catch(e){
//         //     text_dict = [];
//         // }
        
//         // if ((text_dict != null) || (text_dict) || (text_dict.length != 0)) {
//         //     session.replaceDialog('/repeat');
//         // }
//         console.log("----------------------Line : 223 " + text_dict[0] + "and dict lenght = " + text_dict.length );
//         var text_to_repeat = "";
        
//         for (var i = 0; i <  text_dict.length - 1 ; i++){
//             text_to_repeat += text_dict[i].entity + " " ;     
//         }
//         if(text_dict.length!=0){
//             text_to_repeat += text_dict[text_dict.length - 1].entity ;
//         }

//         console.log("----------------------Line : 231 " + text_to_repeat);


//         next({ ttr : text_to_repeat  });
//     },
//     function (session, results) {        
        
        
//         session.send('I think you said this :'+ results.ttr);

//         builder.Prompts.text(session, 'You are in repeat intent (probably again) and I am prompting you to say something to cancel or go again');
//         var cancel_dict = findAllFromName(results.entities,'Exit');
//         console.log("----------------------Line : 241 " + cancel_dict);
        
//         if ( (cancel_dict!=undefined) || (cancel_dict != null) ||  (cancel_dict.length != 0) ){
//             session.replaceDialog('/cancel');
//         }
//         // session.send('Now sending you to main intent');
//         // session.replaceDialog('/main');
//         session.endDialog();
//     }
// ]);


// Custom JS -----------------------------------------
// var e2d = require('./src/entity2dict');


// Custom functions -----------------------------------------
// function findAllFromName(entities,entityName) {
//     var arr = []

//     try {
//         arr = builder.EntityRecognizer.findAllEntities(entities, entityName);
//     }
//     catch (e) {
//         arr = [];
//     }
//     // if ((arr != null) || (arr) || (arr.length != 0)) {

//     // }
//     // console.log("----------------------Line : 113 " + arr[0].entity);
//     return arr;
// }
