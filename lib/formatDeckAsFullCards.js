'use strict';

/**
 * Creates a clone of the existing deck with full card data filled in instead of
 * just card codes.
 *
 * @param {object} deck
 * @param {object} data
 * @param {object} data.cards - an index of card code to full card object
 * @param {object} data.factions - an index of faction code to full faction object
 */
function formatDeckAsFullCards(deck, data) {
    var newDeck = {
        _id: deck._id,
        name: deck.name,
        username: deck.username,
        lastUpdated: deck.lastUpdated,
        faction: Object.assign({}, deck.faction)
    };

    if (deck.alliance) {
        if (deck.alliance.value === '') {
            newDeck.alliance = { name: '', value: '' };
        } else {
            newDeck.alliance = data.factions[deck.alliance.value];
        }
    }

    newDeck.stronghold = processCardCounts(deck.stronghold || []);
    newDeck.role = processCardCounts(deck.role || []);
    newDeck.provinceCards = processCardCounts(deck.provinceCards || []);
    newDeck.conflictCards = processCardCounts(deck.conflictCards || []);
    newDeck.dynastyCards = processCardCounts(deck.dynastyCards || []);

    return newDeck;
}

function processCardCounts(cardCounts, cardData) {
    var cardCountsWithData = cardCounts.map(function (cardCount) {
        return { count: cardCount.count, card: cardCount.card.custom ? cardCount.card : cardData[cardCount.card.code] };
    });

    // Filter out any cards that aren't available in the card data.
    return cardCountsWithData.filter(function (cardCount) {
        return !!cardCount.card;
    });
}

module.exports = formatDeckAsFullCards;