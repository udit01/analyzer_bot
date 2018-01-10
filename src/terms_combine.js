var wordLowerLimit = 4;//broken english if less than this
var wordUpperLimit = 20;

var t2t = require('./text2terms');
var t2n = require('./text2nouns');


function get_terms_combined(input, callbackTerms){

    var currentLength = input.split(" ");
    
    if ((currentLength <= wordUpperLimit) && (wordLowerLimit <= currentLength)){
        t2n.get_nouns(input,callbackTerms);
    }
    else{
        t2t.get_terms(input,callbackTerms);          
    }
}

module.exports = {
    'get_terms_combined': get_terms_combined
}
