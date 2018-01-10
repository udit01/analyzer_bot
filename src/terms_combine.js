var wordLimit = 15;

var t2t = require('./text2terms');
var t2n = require('./text2nouns');


function get_terms_combined(input, callbackTerms){

    var currentLenght = input.split(" ");
    
    if(currentLenght<=wordLimit){
        t2n.get_nouns(input,callbackTerms);
    }
    else{
        t2t.get_terms(input,callbackTerms);          
    }
}

module.exports = {
    'get_terms_combined': get_terms_combined
}
