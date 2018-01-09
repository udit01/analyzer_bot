/*
    Proactive messages
    Rich cards
    Input Hints
    Typing Indicator
*/

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
var FeedbackFormUrl = process.env.FeedbackFormURL;
// var TextAnalyticsAPIKey = process.env.TextAnalyticsAPIKey;

//external sources
var t2t = require('./src/text2terms');
var t2i = require('./src/term2info');
var t2a = require('./src/term2academic');
var bs = require('./src/bingSearch');

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
intents.matches('Exit', '/exit');
// intents.matches('More', '/more');//difficult ?
intents.matches('None', '/main')
// intents.matches('Main', '/main');
// intents.matches('Reminder', '/reminder'); // to set remider after 1 day or something

intents.onDefault((session) => {//for NONE
    // DO SOMETHING RANDOM HERE ----------------------------------------LIKE THOUGHTFUL THINGS OR QUOTES ETC ---------------------  
    session.send('This is the default intent and it repeates your message: \'%s\'.', session.message.text);
});


var introMessage = ['I help to find relevant information both current and all-time\n\n Get results Relevant to academica, general definations and more ',
    'Deveoped by :-\n\n Udit Jain, Soumya Sharma, Akshat Khare.'
];

var helpMessage = ['This message will contain the usage information how to use.\n\n Next Line'
    // , 'Another Message.'
];


bot.dialog('/greeting', [
    // function (session, args, next) {
    //      builder.Prompts.text(session, 'Hello there! I am analyzer bot ');
    // },
    function (session, args,next) {
        // session.send('Hello there! I am analyzer bot and send the para you want to analyze');
        builder.Prompts.text(session, 'Hello there! I am analyzer bot and text the para you want to analyze.')
    
    },
    function(session,results){

        session.conversationData.greetingPrompt = results.response;
        
        // i dont want to come back
        session.replaceDialog('/main');
    }
]);



bot.dialog('/exit', [
    function (session, args, next) {
        //add would you really like to delete conversational data ?
        builder.Prompts.confirm(session, "Are you sure you wish to delete this conversation's context?");
    },
    function (session,results) {
        //experimental
        // session.userData.exitBool = results.response.text;//does it return yes no ?
        // session.sendTyping();
        //check syntax
        if (results.response == true){
            session.send('Thank you! Hope You enjoyed our services! Please come again!\\n Meanwhile you can fill this optional survey to help us serve you better');
            session.send(""+FeedbackFormUrl);
            session.endConversation();
        }
        else{
            //i want to start a new dialogue not come back
            session.replaceDialog('/greeting');
        }
        
    },
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

        helpMessage.forEach(function (ms) {
            session.send(ms);
        });
        session.endDialog();
    }
]);

bot.dialog('/main', [
    function (session, args, next) {
        //check for the user-data completeness here
        // save the data sent by user to jump to this intent somewhere!
        
        session.conversationData.mainEntry = session.message.text ;  //starting para of the user
        
        session.sendTyping();
        
        try {
            session.conversationData.boolTermsAPI = false;

            function callback(jsonarr) {//this is by call back function from which i want a promise to be returned
                
                session.conversationData.terms = jsonarr;
                session.send("Your key words detected by us are :" + session.conversationData.terms);
                // let termPromise = new Promise();
                session.conversationData.boolTermsAPI = true;
            }
            
            t2t.get_terms(session.conversationData.mainEntry, callback );

          
        }
        catch (e) {
            console.log("" + e);
        }

        builder.Prompts.choice(session, "What would you like search results about<Which Index Number>?", "Proper Noun <Entities>|Current info <News>|People also search for <Recommendations/Similar>|Scientific Domain <Academica>|Term-Definition <Meaning>|External Search Engine(s) Links|Help|Exit", { listStyle : builder.ListStyle.auto});
        //experimental
        // builder.Prompts.attachment(session, "Upload a picture for me to transform.");
    },
    // function (session, args, next) {
    //     //experimental
    //     // term = args;
    // },
    function (session, args, next) {
        
        session.conversationData.mainPrompt = args.response;//why is this not getting any text ?
        
        session.sendTyping();
        
        session.send("You selected option:"+session.conversationData.mainPrompt.text);
        
        if (args.response) {
            // var intents_in_resp = results.response.intents;
            // if (results.response.entity === 'Exit') {//exit is an intent in our case, ... how to get intent ?
            //     session.endDialog("Thanks for using. You can chat again by saying Hi");
            // }
            // else {
            
            //DO ERROR CHECKING FOR VERY LARGE LENGHT OF PARAS, TAKE FIRST 500 WORDS OR SUCH

            //FIRST CALL A GENERIC JS WHICH GIVES KEYWORDS FROM PARA
            session.conversationData.boolBingSearchAPI = false;
            
            //below is the code to print the searched data
            // PASS APPENDED KEYWORDS INTO THE BING SEARCH
            // bs.getData(session.conversationData.mainEntry,
            //     function(jsondat){
            //         session.conversationData.searchedData = jsondat;
            //         session.send(session.conversationData.searchedData);
            //     }
            // );

            switch (args.response.entity) {
                case "Proper Noun <Entities>":
                    //term to info

                    //call a JS in the source here
                    session.send("Proper Noun case detected");

                    while (!session.conversationData.boolTermsAPI){
                        //waiting for being true
                    }
                    //now begin that dialogue
                    //call the proper noun dialogue with session.begin
                    session.beginDialog('/properNoun');//With what data ?
                    break;
                case "Current info <News>":

                    //News API, terms  

                    //call a JS in the source here
                    session.send("Current info case detected");  
                    session.beginDialog('/current');                  
                    break;
                case "People also search for <Recommendations/Similar>":

                    //bing search recommnedation api 

                    //call a JS in the source here
                    session.send("People also search for case detected");
                    session.beginDialog('/similar');                                      
                    break;
                case "Scientific Domain <Academica>":
                    
                    session.send("Scientific domain case detected");
                    //academic api
                    while (!session.conversationData.boolTermsAPI) {
                        //waiting for being true
                    }
                    //call a JS in the source here
                    session.beginDialog('/acad');                                      
                    
                    break;
                case "Term-Defination <Meaning>":
                    //call a JS in the source here//and the displayer
                    //oxford api
                    //do something dictionary meaning ?

                    session.send("Term defination case detected");
                    session.beginDialog('/meaning');                                      
                    break;
                case "External Search Engine(s) Links":

                    //write Explicit JS code for this

                    session.send("External search engine links requested");
                    session.beginDialog('/more');
                case "Help":
                    //do i want the help dialogue to return here ?
                    session.beginDialog("/help")
                    break;
                case "Exit":
                    session.replaceDialog('/exit');
                    break;
                // default:
                //     session.replaceDialog('/more')
                //PUSH IT INTO A GENERIC SEARCH OR MORE CASE 
            }   
            session.send('You are after the switch case in main');
            // }
        }
        else {
            session.endDialog("Invalid Response. You can start again by texting the paragraph you want to analyze");
        }
    },
    function (session, args,next) {
        // The menu runs a loop until the user chooses to (quit).
        builder.Prompts.confirm("Do you want some more external links to the common search enginers ? ")
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        // session.conversationData.moreBool = results.response;
        
        //CHECK SYNTAX BELOW
        if (results.response == true ){
            session.replaceDialog('/more');
        }
        session.endDialog();
    }    
]);


//below dialogue calls the JS and prettifies the output
bot.dialog('/properNoun', [
    function (session, args, next) {
        //generic callback
        session.send('In proper noun dialogue.');
        
        function callbackTerms2Info(jsonData,oquery,stringCode) {//this is by call back function from which i want a promise to be returned
            if (stringCode == "success"){
                session.send("Your keyword was: " + oquery + " .\n\n Related information is: " + jsonData);
            }
            else{
                // session.send("Your word was: " + oquery + " .\n\n Related information was not found by Bing Entity Search");
            }
            // resolveTrue = true;
        }
        for(i in session.conversationData.terms){    

            try {
                // var resolveTrue = false
                t2i.get_info(session.conversationData.terms[i], callbackTerms2Info );
            }
            catch (e) {
                console.log("" + e);
            }
        }
        next();
    },
    function (session, results) {
        session.send("Proper Noun dialogue has ended but wait for API call to finish!");
        // session.endDialog("Proper Noun dialogue has ended but wait for API call to finish!");
    }
]);

bot.dialog('/current', [
    function (session, args, next) {
        //call some API in the src directory with the conversation data you have
    },
    function (session, results) {

        session.endDialog();
    }
]);

bot.dialog('/similar', [
    function (session, args, next) {
        //call some API in the src directory with the conversation data you have
    },
    function (session, results) {

        session.endDialog();
    }
]);

bot.dialog('/acad', [
    function (session, args, next) {
        session.send("In Academic dialogue");
        
        function callbackTerms2Acad(jsonData, oquery, stringCode) {//this is by call back function from which i want a promise to be returned
            
            if (stringCode == "success") {
                session.send("Your keyword was: " + oquery + " .\n\n Related information is: " + jsonData);
            }
            else {
                // session.send("Your word was: " + oquery + " .\n\n Related information was not found by Bing Entity Search");
            }
            // resolveTrue = true;
        }
        for (i in session.conversationData.terms) {

            try {
                // var resolveTrue = false
                t2a.get_queries(session.conversationData.terms[i], callbackTerms2Acad);
            }
            catch (e) {
                console.log("" + e);
            }
        }
        next();
    },
    function (session, results) {
        session.send("End of Academic dialogue");
        // session.endDialog();
    }
]);

bot.dialog('/meaning', [
    function (session, args, next) {
        //call some API in the src directory with the conversation data you have
    },
    function (session, results) {

        session.endDialog();
    }
]);

bot.dialog('/more',[
    function(session,args,next){
        //session.conversationData.mainEntry will contain the original text, meanwhile we can store the keywords
        session.send('Here are some more links to satisfy your curosity:');
    },
    function(session,results){
        //call some common search engine dictionary from src js folder
        
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
