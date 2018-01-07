/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

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
// intents.matches('main', '/main');
// intents.matches('intro', '/intro');
intents.matches('Help', '/help');
intents.matches('Greeting', '/greeting');
intents.matches('Cancel', '/cancel');
intents.matches('Repeat', '/repeat');
// intents.matches('None', '/none');

// different than campus bot
intents.onDefault((session) => {
    console.log("LINE83");    
    session.send('This is the default intent \'%s\'.', session.message.text);
});


var introMessage = ['This is the intro message has a binary string collection',
    'Used in \help',
    'Write here the functionalites of our bot',
    'Like generic and specific search etc'
];



// Custom JS -----------------------------------------
var e2d = require('./src/entity2dict');


// Custom functions -----------------------------------------
function findAllFromName(entityName) {
    var dict = []

    try {
        dict = builder.EntityRecognizer.findAllEntities(args.entities, entityName);
    }
    catch (e) {
        dict = [];
    }
    // if ((dict != null) || (dict) || (dict.length != 0)) {

    // }
    return dict;
}




bot.dialog('/main', [
    function (session, args, next) {
        //check for the user-data completeness here
        
        // idk why the below function call is required
        next();
    },
    function (session, args, next) {
        //think on the line
        builder.Prompts.text(session, 'This is the prompt in main inent in function 2');
        
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
bot.dialog('/cancel', [
    function (session , args , next) {
        builder.Prompts.text(session,'You are in cancel intent and I am prompting you');
    },
    function (session , results){
        session.send('After this message the stack will be reset by session.replaceDialogue(main)');
        // session.replaceDialog('/main');
        session.clearDialogStack();
        session.endDialog();
    }
]);

// bot.dialog('/none', [
//     function (session) {
//         session.send('You are in None intent and after this, session.endDialogue will be called.');
//         session.endDialog();
//     }
// ]);

bot.dialog('/greeting', [
    function (session, args, next) {
        builder.Prompts.text(session, 'You are in greeting intent and I am prompting you from 1st function');
    },
    function (session, results) {
        session.send('After this message the stack will be reset by session.replaceDialogue(main)');
        // session.replaceDialog('/main');
        session.endDialog();
    }
]);

bot.dialog('/repeat', [
    function (session, args, next) {
        builder.Prompts.text(session, 'You are in repeat intent (probably again) and I am prompting you to say something so that i will repeat it');
        
        var cancel_dict = e2d.findAllFromName('Cancel');
        //want to test this but too dificult ?
        if ((cancel_dict != null) || (cancel_dict) || (cancel_dict.length != 0) ){
            session.replaceDialog('/cancel');
        }
        
        var text_dict = e2d.findAllFromName('repeat-text');
        // try{
        //     text_dict = builder.EntityRecognizer.findAllEntities(args.entities,'repeat-text');
        // }
        // catch(e){
        //     text_dict = [];
        // }
        
        if ((text_dict != null) || (text_dict) || (text_dict.length != 0)) {
            session.replaceDialog('/repeat');
        }
        
        var text_to_repeat = "";
        
        for (var i = 0; i <  text_dict.length - 1 ; i++){
            text_to_repeat += text_dict[i] + " " ;     
        }
        text_to_repeat += text_dict[ text_dict.length - 1] ;

        next({ response : text_to_repeat  });
    },
    function (session, results) {        
        
        
        session.send('I think you said this :'+ text_to_repeat);
        session.send('Now sending you to main intent');
        session.replaceDialog('/main');
        session.endDialog();
    }
]);