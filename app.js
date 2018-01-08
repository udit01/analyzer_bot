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
    // appId: process.env.MicrosoftAppId,
    // appPassword: process.env.MicrosoftAppPassword,
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

//external sources
var t2t = require('./src/text2terms');

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


var introMessage = ['I help to find relevant information both current and all-time\n Get results Relevant to academica, general definations and more ',
    'Deveoped by :-\n Udit Jain, Soumya Sharma, Akshat Khare.'
];

var helpMessage = ['This message will contain the usage information how to use.\n Next Line',
    'Another Message.'
];


bot.dialog('/greeting', [
    // function (session, args, next) {
    //      builder.Prompts.text(session, 'Hello there! I am analyzer bot ');
    // },
    function (session, args,next) {
        // session.send('Hello there! I am analyzer bot and send the para you want to analyze');
        session.Prompts.text(session, 'Hello there! I am analyzer bot and text the para you want to analyze.')
    
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
        session.userData.exitBool = results.response.text;//does it return yes no ?
        // session.sendTyping();
        
        //check syntax
        if (session.userData.exitBool.toUpperCase() == 'YES'){
            session.send('Thank you! Hope You enjoyed our services! Please come again!\n Meanwhile you can fill this optional survey to help us serve you better');
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

        builder.Prompts.choice(session, "What would you like search results about \n(type end to quit)?", "Proper Noun\n<Entities>|Current info\n<News>|People also search for\n<Recommendations/Similar>|Scientific Domain\n<Academica>|Term-Defination\n<Meaning>|Help|Exit", { listStyle : builder.ListStyle.auto});
        //experimental
        // builder.Prompts.attachment(session, "Upload a picture for me to transform.");
    },
    function (session, args, next) {
        //experimental
        session.sendTyping();
        // term = args;
        session.conversationData.mainPrompt = args.response.text;
        // session.send(bing_web_search(term));
        t2t.get_terms(session.conversationData.start, 
			function (jsonarr){
				session.conversationData.terms = jsonarr;
            })
        
        session.send(session.conversationData.mainPrompt);
        session.send(session.conversationData.terms);
        
        if (results.response) {
            // var intents_in_resp = results.response.intents;
            // if (results.response.entity === 'Exit') {//exit is an intent in our case, ... how to get intent ?
            //     session.endDialog("Thanks for using. You can chat again by saying Hi");
            // }
            // else {
            
            //DO ERROR CHECKING FOR VERY LARGE LENGHT OF PARAS, TAKE FIRST 500 WORDS OR SUCH

            //FIRST CALL A GENERIC JS WHICH GIVES KEYWORDS FROM PARA
            
            
            switch (results.response.entity) {
                case "Proper Noun\n<Entities>":
                    // session.beginDialog('/events');
                    //call a JS in the source here
                    session.send("Proper Noun case detected");
                    //call the proper noun dialogue with session.begin
                    // session.beginDialog('/properNoun');//With what data ?
                    break;
                case "Current info\n<News>":
                    //call a JS in the source here
                    session.send("Current info case detected");                    
                    break;
                case "People also search for\n<Recommendations/Similar>":
                    //call a JS in the source here
                    session.send("People also search for case detected");
                    break;
                case "Scientific Domain\n<Academica>":
                    //call a JS in the source here
                    session.send("Scientific domain case detected");
                    break;
                case "Term-Defination\n<Meaning>":
                    //call a JS in the source here//and the displayer
                    session.send("Term defination case detected");
                    break;
                case "Help":
                    //do i want the help dialogue to return here ?
                    session.beginDialog("/help")
                    break;
                case "Exit":
                    session.replaceDialog('/exit');
                    break;
                default:
                    session.replaceDialog('/more')
                //PUSH IT INTO A GENERIC SEARCH OR MORE CASE 
            }
            // }
        }
        else {
            session.endDialog("Invalid Response. You can start again by texting the paragraph you want to analyze");
        }
    },
    function (session, args,next) {
        // The menu runs a loop until the user chooses to (quit).
        session.Prompts.confirm("Do you want some more external links to the common search enginers ? ")
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        // session.conversationData.moreBool = results.response;
        
        //CHECK SYNTAX BELOW
        if (results.response.text.toUpperCase() == 'YES' ){
            session.replaceDialog('/more');
        }
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
])

//below dialogue calls the JS and prettifies the output
bot.dialog('/properNoun',[
    function (session, args, next) {
        //call some API in the src directory with the conversation data you have
    },
    function (session, results) {

        session.endDialog();
    }
])

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
