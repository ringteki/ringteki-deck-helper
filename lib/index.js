'use strict';

var DeckValidator = require('./DeckValidator');
/* const formatDeckAsFullCards = require('./formatDeckAsFullCards'); */
/* const formatDeckAsShortCards = require('./formatDeckAsShortCards'); */

module.exports = {
    /* formatDeckAsFullCards: formatDeckAsFullCards, */
    /* formatDeckAsShortCards: formatDeckAsShortCards, */
    validateDeck: function validateDeck(deck, options) {
        options = Object.assign({ includeExtendedStatus: true }, options);

        var validator = new DeckValidator(options.packs);
        var result = validator.validateDeck(deck);

        if (!options.includeExtendedStatus) {
            delete result.extendedStatus;
        }

        return result;
    }
};