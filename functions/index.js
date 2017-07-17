'use strict';

process.env.DEBUG = 'actions-on-google:*';
const ApiAiApp = require('actions-on-google').ApiAiApp;
const functions = require('firebase-functions');
const firebaseAdmin = require('firebase-admin');
const https = require('https');
firebaseAdmin.initializeApp(functions.config().firebase);

// API.AI actions
const WELCOME_ACTION = 'input.welcome';
const DEAL_ACTION = 'input.deal';
const HELP_ACTION = 'input.help';
const UNHANDLED_DEEP_LINK_ACTION = 'deeplink.unknown';

const MEH_BASE_URL = "https://api.meh.com/1/current.json?apikey=";
const MEH_API_KEY = process.env.MEH_API_KEY || functions.config().meh.key || "";

const WOOT_BASE_URL = "https://api.woot.com/2/events.json";
const WOOT_API_KEY = process.env.WOOT_API_KEY || functions.config().woot.key || "";
const WOOT_SELECT = "offers.title,offers.items,offers.soldout";

// arrayToReadableString([item1,item2], ", ", " and ")
function arrayToReadableString(array, join, finalJoin) {
	var arr = array.slice(0),
		last = arr.pop();
	join = join || ', ';
	finalJoin = finalJoin || ' and ';
	return arr.join(join) + finalJoin + last;
};

function getMehText(callback){
    var body = "";
    var speakText = "";
    https.get(MEH_BASE_URL + MEH_API_KEY, function(res) {
        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            try{
                var result = JSON.parse(body);

                // check for single item or multiple items
                if(result.deal.items.length > 1){
                    var minPrice = null;
                    var maxPrice = 0;
                    for(var i = 0; i < result.deal.items.length; i++){
                        if(result.deal.items[i].price < minPrice || minPrice == null) minPrice = result.deal.items[i].price;
                        if(result.deal.items[i].price > maxPrice) maxPrice = result.deal.items[i].price;
                    }
                    speakText = "Today's <sub alias='mey'>Meh</sub> deal is a choice of " + result.deal.title + " starting at $" + minPrice;
                }else{
                    speakText = "Today's <sub alias='mey'>Meh</sub> deal is a " + result.deal.title + " for $" + result.deal.items[0].price;
                }

                callback(null, "<speak>" + speakText + "</speak>");
            }catch(e){
                speakText = "<speak>Sorry, I got an unexpected response from <sub alias='mey'>Meh</sub>. Please try again later.</speak>";
                callback(e, speakText);
            }
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
        speakText = "<speak>Sorry, I was unable to reach <sub alias='mey'>Meh</sub>. Please try again later.</speak>";
        callback(e, speakText);
    });
}


function getWootText(service, callback){
    var spokenType = "";
    var type = "";
    switch(service){
        case "woot":
            spokenType = "Woot";
            type = "www.woot.com";
            break;
        case "home woot":
            spokenType = "Home Woot";
            type = "home.woot.com";
            break;
        case "electronics woot":
            spokenType = "Electronics Woot";
            type = "electronics.woot.com";
            break;
        case "computers woot":
            spokenType = "Computers Woot";
            type = "computers.woot.com";
            break;
        case "tools woot":
            spokenType = "Tools Woot";
            type = "tools.woot.com";
            break;
        case "sports woot":
            spokenType = "Sport Woot";
            type = "sport.woot.com";
            break;
        case "accessories woot":
            spokenType = "Accessories Woot";
            type = "accessories.woot.com";
            break;
        case "kids woot":
            spokenType = "Kids Woot";
            type = "kids.woot.com";
            break;
        case "shirt woot":
            spokenType = "Shirt Woot";
            type = "shirt.woot.com";
            break;
        case "wine woot":
            spokenType = "Wine Woot";
            type = "wine.woot.com";
            break;
        case "sellout woot":
            spokenType = "Sellout Woot";
            type = "sellout.woot.com";
            break;
    }

    var body = "";
    var speakText = "";

    https.get(WOOT_BASE_URL + "?select=offers.title,offers.items,offers.soldout&key=" + WOOT_API_KEY + "&site=" + type + "&eventType=daily", function(res) {
        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            try{
                var result = JSON.parse(body);

                if(result.length && result[0].Offers.length){

                    // check for single item or multiple items
                    if(result[0].Offers[0].Items.length > 1){
                        var minPrice = null;
                        var maxPrice = 0;
                        for(var i = 0; i < result[0].Offers[0].Items.length; i++){
                            if(result[0].Offers[0].Items[i].SalePrice < minPrice || minPrice == null) minPrice = result[0].Offers[0].Items[i].SalePrice;
                            if(result[0].Offers[0].Items[i].SalePrice > maxPrice) maxPrice = result[0].Offers[0].Items[i].SalePrice;
                        }

                        if(result[0].Offers[0].SoldOut){
                            speakText = "Today's " + spokenType + " is sold out. It was a choice of " + result[0].Offers[0].Title + " starting at $" + minPrice;
                        }else{
                            speakText = "Today's " + spokenType + " deal is a choice of " + result[0].Offers[0].Title + " starting at $" + minPrice;
                        }
                    }else{
                        if(result[0].Offers[0].SoldOut){
                            speakText = "Today's " + spokenType + " is sold out. It was " + (type == "shirt.woot.com" ? "called " : "a ") + result[0].Offers[0].Title + " for $" + result[0].Offers[0].Items[0].SalePrice;
                        }else{
                            speakText = "Today's " + spokenType + " deal is " + (type == "shirt.woot.com" ? "called " : "a ") + result[0].Offers[0].Title + " for $" + result[0].Offers[0].Items[0].SalePrice;
                        }
                    }
                }else{
                    speakText = "It's a " + spokenType + "-off!";
                }

                callback(null, "<speak>" + speakText + "</speak>");
            }catch(e){
                speakText = "Sorry, I got an unexpected response from " + spokenType + ". Please try again later.";
                callback(e, "<speak>" + speakText + "</speak>");
            }
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
        speakText = "Sorry, I was unable to reach " + spokenType + ". Please try again later.";
        callback(e, "<speak>" + speakText + "</speak>");
    });
}


exports.bargainBuddy = functions.https.onRequest((request, response) => {
    //console.log('Request headers: ' + JSON.stringify(request.headers));
    //console.log('Request body: ' + JSON.stringify(request.body));

    const app = new ApiAiApp({request, response});

    let hasScreen = app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT);

    var SUPPORTED_MERCHANTS = [
        "Woot",
        "<sub alias='mey'>Meh</sub>",
        "Home Woot",
        "Electronics Woot",
        "Computers Woot",
        "Tools Woot",
        "Sport Woot",
        "Accessories Woot",
        "Kids Woot",
        "Sellout Woot",
        "Wine Woot",
        "Shirt Woot"
    ];

    var SUGGESTED_MERCHANTS = [
        "Woot",
        "Meh",
        "Home Woot",
        "Electronics Woot",
        "Tools Woot",
        "Sport Woot",
        "Accessories Woot",
        "Kids Woot"
    ];

    function greetUser (app) {
        app.ask(
            app.buildRichResponse()
            .addSimpleResponse(`<speak>Welcome to Bargain Buddy! <break time="500ms"/> \
            What daily deal would you like me to find?</speak>`)
            .addSuggestions(SUGGESTED_MERCHANTS)
        );
    }

    function listMerchants (app) {
        app.ask(
            app.buildRichResponse()
            .addSimpleResponse(`<speak>I can tell you the current deal from ` + arrayToReadableString(SUPPORTED_MERCHANTS, ', ', ' and ') + `. Which would you like?</speak>`)
            .addSuggestions(SUGGESTED_MERCHANTS)
        );
    }

    function unhandledDeepLinks (app) {
        app.ask(
            app.buildRichResponse()
            .addSimpleResponse(`Sorry, Bargain Buddy cannot get deals from \
                ${app.getRawInput()}. \
                However, I can get the deal from Woot or <sub alias='mey'>Meh</sub>. Which do you prefer?`)
            .addSuggestions(SUGGESTED_MERCHANTS)
        );
    }

    function routeDeal (app) {
        if(!app.getArgument('merchant')){
            console.log(app);
            dealError();
        }else if(app.getArgument('merchant') == 'meh'){
            mehDeal(app);
        }else{
            wootDeal(app);
        }
    }

    function mehDeal (app) {
        getMehText(function(err, result){
            app.tell(result);
        });
    }

    function wootDeal (app) {
        getWootText(app.getArgument('merchant'), function(err, result){
            app.tell(result);
        });
    }

    function dealError () {
        app.tell(`<speak>I'm having trouble fetching deals right now. Please try again later.</speak>`);
    }

    let actionMap = new Map();
    actionMap.set(WELCOME_ACTION, greetUser);
    actionMap.set(UNHANDLED_DEEP_LINK_ACTION, unhandledDeepLinks);
    actionMap.set(DEAL_ACTION, routeDeal);
    actionMap.set(HELP_ACTION, listMerchants);
    app.handleRequest(actionMap);
});
