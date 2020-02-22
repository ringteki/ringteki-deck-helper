/**
 * Creates a clone of the existing deck with only card codes instead of full
 * card data.
 */
function formatDeckAsShortCards(deck) {
    let newDeck = {
        _id: deck._id,
        name: deck.name,
        username: deck.username,
        lastUpdated: deck.lastUpdated,
        faction: { name: deck.faction.name, value: deck.faction.value }
    };

    if(deck.alliance) {
        if(deck.alliance.value === '') {
            newDeck.alliance = { name: '', value: '' };
        } else {
            newDeck.alliance.name = deck.alliance.name;
            newDeck.alliance.value = deck.alliance.value;
        }
    }

    newDeck.stronghold = formatCards(deck.stronghold || []);
    newDeck.role = formatCards(deck.role || []);
    newDeck.provinceCards = formatCards(deck.provinceCards || []);
    newDeck.conflictCards = formatCards(deck.conflictCards || []);
    newDeck.dynastyCards = formatCards(deck.dynastyCards || []);

    return newDeck;
}

function formatCards(cardCounts) {
    return cardCounts.map(cardCount => {
        return { count: cardCount.count, card: cardCount.card.custom ? cardCount.card : { code: cardCount.card.code } };
    });
}

module.exports = formatDeckAsShortCards;
