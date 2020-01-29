'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var restrictedList = {
    version: '9',
    cards: ['kuroi-mori', 'secret-cache', 'rebuild', 'mirumoto-s-fury', 'forged-edict', 'spyglass', 'embrace-the-void', 'pathfinder-s-blade', 'policy-debate', 'the-imperial-palace', 'consumed-by-five-fires', 'cunning-magistrate', 'a-fate-worse-than-death', 'void-fist', 'mark-of-shame', 'magistrate-station', 'kakita-toshimoko', 'gateway-to-meido']
};

var RestrictedList = function () {
    function RestrictedList() {
        _classCallCheck(this, RestrictedList);
    }

    _createClass(RestrictedList, [{
        key: 'validate',
        value: function validate(cards) {
            var cardsOnRestrictedList = cards.filter(function (card) {
                return restrictedList.cards.includes(card.id);
            });

            var errors = [];

            if (cardsOnRestrictedList.length > 1) {
                errors.push('Contains more than 1 card on the FAQ v' + restrictedList.version + ' restricted list: ' + cardsOnRestrictedList.map(function (card) {
                    return card.name;
                }).join(', '));
            }

            return {
                version: restrictedList.version,
                valid: errors.length === 0,
                errors: errors,
                restrictedCards: cardsOnRestrictedList
            };
        }
    }]);

    return RestrictedList;
}();

module.exports = RestrictedList;