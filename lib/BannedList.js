'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var bannedList = {
    version: '12',
    cards: ['guest-of-honor', 'charge', 'isawa-tadaka', 'karada-district', 'master-of-gisei-toshi', 'kanjo-district', 'jurojin-s-curse', 'hidden-moon-dojo', 'mirumoto-daisho']
};

var BannedList = function () {
    function BannedList() {
        _classCallCheck(this, BannedList);
    }

    _createClass(BannedList, [{
        key: 'validate',
        value: function validate(cards) {
            var cardsOnBannedList = cards.filter(function (card) {
                return bannedList.cards.includes(card.id);
            });

            var errors = [];

            if (cardsOnBannedList.length > 1) {
                errors.push('Contains a card on the FAQ v' + bannedList.version + ' banned list: ' + cardsOnBannedList.map(function (card) {
                    return card.name;
                }).join(', '));
            }

            return {
                version: bannedList.version,
                valid: errors.length === 0,
                errors: errors,
                bannedCards: cardsOnBannedList
            };
        }
    }]);

    return BannedList;
}();

module.exports = BannedList;