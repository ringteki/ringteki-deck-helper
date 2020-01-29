'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var $ = require('jquery'); // eslint-disable-line no-unused-vars
var _ = require('underscore');
var moment = require('moment');

var RestrictedList = require('./RestrictedList');
var BannedList = require('./BannedList');

var openRoles = ['keeper-of-air', 'keeper-of-earth', 'keeper-of-fire', 'keeper-of-water', 'keeper-of-void', 'seeker-of-air', 'seeker-of-earth', 'seeker-of-fire', 'seeker-of-water', 'seeker-of-void', 'support-of-the-crane', 'support-of-the-phoenix', 'support-of-the-scorpion', 'support-of-the-unicorn', 'support-of-the-lion', 'support-of-the-crab', 'support-of-the-dragon'];

function getDeckCount(deck) {
    var count = 0;

    _.each(deck, function (card) {
        count += card.count;
    });

    return count;
}

function isCardInReleasedPack(packs, card) {
    var packsWithCard = _.compact(_.map(card.pack_cards, function (pack) {
        return _.find(packs, function (p) {
            return p.id === pack.pack.id;
        });
    }));

    if (packsWithCard.length === 0) {
        return false;
    }

    var releaseDates = _.compact(_.map(packsWithCard, function (pack) {
        return pack.available || pack.released_at;
    }));

    if (releaseDates.length === 0) {
        return false;
    }

    var now = moment();

    return _.any(releaseDates, function (date) {
        return moment(date, 'YYYY-MM-DD') <= now;
    });
}

function rulesForKeeperRole(element) {
    return {
        influence: 3,
        roleRestrictions: ['keeper', element]
    };
}

function rulesForSeekerRole(element) {
    return {
        maxProvince: _defineProperty({}, element, 1),
        roleRestrictions: ['seeker', element]
    };
}

function rulesForSupportRole(faction) {
    return {
        influence: 8,
        roleRestrictions: ['support'],
        rules: [{
            message: 'Support roles can only be used with the match alliance clan',
            condition: function condition(deck) {
                return deck.alliance.value === faction;
            }
        }]
    };
}

/**
 * Validation rule structure is as follows. All fields are optional.
 *
 * requiredDraw  - the minimum amount of cards required for the draw deck.
 * requiredPlots - the exact number of cards required for the plot deck.
 * maxDoubledPlots - the maximum amount of plot cards that can be contained twice in the plot deck.
 * mayInclude    - function that takes a card and returns true if it is allowed in the overall deck.
 * cannotInclude - function that takes a card and return true if it is not allowed in the overall deck.
 * rules         - an array of objects containing a `condition` function that takes a deck and return true if the deck is valid for that rule, and a `message` used for errors when invalid.
 */
var roleRules = {
    'keeper-of-air': rulesForKeeperRole('air'),
    'keeper-of-earth': rulesForKeeperRole('earth'),
    'keeper-of-fire': rulesForKeeperRole('fire'),
    'keeper-of-void': rulesForKeeperRole('void'),
    'keeper-of-water': rulesForKeeperRole('water'),
    'seeker-of-air': rulesForSeekerRole('air'),
    'seeker-of-earth': rulesForSeekerRole('earth'),
    'seeker-of-fire': rulesForSeekerRole('fire'),
    'seeker-of-void': rulesForSeekerRole('void'),
    'seeker-of-water': rulesForSeekerRole('water'),
    'support-of-the-crane': rulesForSupportRole('crane'),
    'support-of-the-phoenix': rulesForSupportRole('phoenix'),
    'support-of-the-scorpion': rulesForSupportRole('scorpion'),
    'support-of-the-unicorn': rulesForSupportRole('unicorn'),
    'support-of-the-lion': rulesForSupportRole('lion'),
    'support-of-the-crab': rulesForSupportRole('crab'),
    'support-of-the-dragon': rulesForSupportRole('dragon')
};

var DeckValidator = function () {
    function DeckValidator(packs) {
        _classCallCheck(this, DeckValidator);

        this.packs = packs;
        this.bannedList = new BannedList();
        this.restrictedList = new RestrictedList();
    }

    _createClass(DeckValidator, [{
        key: 'validateDeck',
        value: function validateDeck(deck) {
            var _this = this;

            var errors = [];
            var unreleasedCards = [];
            var rules = this.getRules(deck);
            var stronghold = deck.stronghold.length > 0 ? deck.stronghold[0].card : null;
            var role = deck.role.length > 0 ? deck.role[0].card : null;
            var provinceCount = getDeckCount(deck.provinceCards);
            var dynastyCount = getDeckCount(deck.dynastyCards);
            var conflictCount = getDeckCount(deck.conflictCards);

            if (deck.stronghold.length > 1) {
                errors.push('Too many strongholds');
            }

            if (deck.role.length > 1) {
                errors.push('Too many roles');
            }

            if (provinceCount < rules.requiredProvinces) {
                errors.push('Too few province cards');
            } else if (provinceCount > rules.requiredProvinces) {
                errors.push('Too many province cards');
            }

            if (dynastyCount < rules.minimumDynasty) {
                errors.push('Too few dynasty cards');
            } else if (dynastyCount > rules.maximumDynasty) {
                errors.push('Too many dynasty cards');
            }

            if (conflictCount < rules.minimumConflict) {
                errors.push('Too few conflict cards');
            } else if (conflictCount > rules.maximumConflict) {
                errors.push('Too many conflict cards');
            }

            _.each(rules.rules, function (rule) {
                if (!rule.condition(deck)) {
                    errors.push(rule.message);
                }
            });

            var allCards = deck.provinceCards.concat(deck.dynastyCards).concat(deck.conflictCards);
            var cardCountByName = {};

            _.each(allCards, function (cardQuantity) {
                cardCountByName[cardQuantity.card.name] = cardCountByName[cardQuantity.card.name] || { name: cardQuantity.card.name, faction: cardQuantity.card.clan, influence: cardQuantity.card.influence_cost, limit: cardQuantity.card.deck_limit, count: 0, allowed_clans: cardQuantity.card.allowed_clans };
                cardCountByName[cardQuantity.card.name].count += cardQuantity.count;

                if (!rules.mayInclude(cardQuantity.card) || rules.cannotInclude(cardQuantity.card) || cardQuantity.card.role_restriction && !rules.roleRestrictions.includes(cardQuantity.card.role_restriction)) {
                    errors.push(cardQuantity.card.name + ' is not allowed by clan, alliance or role');
                }

                if (!isCardInReleasedPack(_this.packs, cardQuantity.card)) {
                    unreleasedCards.push(cardQuantity.card.name + ' is not yet released');
                }
            });

            if (!stronghold) {
                errors.push('No stronghold');
            } else if (!isCardInReleasedPack(this.packs, stronghold)) {
                unreleasedCards.push(stronghold.name + ' is not yet released');
            }

            if (role && !isCardInReleasedPack(this.packs, role)) {
                unreleasedCards.push(role.name + ' is not yet released');
            }

            _.each(rules.maxProvince, function (amount, element) {
                var provinces = _.filter(deck.provinceCards, function (card) {
                    return card.card.element === element;
                });
                if (provinces.length > amount) {
                    errors.push('Too many provinces with ' + element + ' element');
                }
            });

            _.each(cardCountByName, function (card) {
                if (card.count > card.limit) {
                    errors.push(card.name + ' has limit ' + card.limit);
                }
            });

            var totalInfluence = _.reduce(cardCountByName, function (total, card) {
                if (card.influence && card.faction !== deck.faction.value) {
                    return total + card.influence * card.count;
                }
                return total;
            }, 0);

            if (totalInfluence > rules.influence) {
                errors.push('Total influence (' + totalInfluence.toString() + ') is higher than max allowed influence (' + rules.influence.toString() + ')');
            }

            var restrictedResult = this.restrictedList.validate(allCards.map(function (cardQuantity) {
                return cardQuantity.card;
            }));
            var bannedResult = this.bannedList.validate(allCards.map(function (cardQuantity) {
                return cardQuantity.card;
            }));

            return {
                basicRules: errors.length === 0,
                noUnreleasedCards: unreleasedCards.length === 0,
                officialRole: !role || openRoles.includes(role.id),
                faqRestrictedList: restrictedResult.valid && bannedResult.valid,
                faqVersion: restrictedResult.version,
                provinceCount: provinceCount,
                dynastyCount: dynastyCount,
                conflictCount: conflictCount,
                extendedStatus: errors.concat(unreleasedCards, restrictedResult.errors, bannedResult.errors)
            };
        }
    }, {
        key: 'getRules',
        value: function getRules(deck) {
            var standardRules = {
                minimumDynasty: 40,
                maximumDynasty: 45,
                minimumConflict: 40,
                maximumConflict: 45,
                requiredProvinces: 5,
                maxProvince: {
                    air: 1,
                    earth: 1,
                    fire: 1,
                    void: 1,
                    water: 1
                }
            };
            var factionRules = this.getFactionRules(deck.faction.value.toLowerCase());
            var allianceRules = this.getAllianceRules(deck.alliance.value.toLowerCase(), deck.faction.value.toLowerCase());
            var roleRules = this.getRoleRules(deck.role.length > 0 ? deck.role[0].card : null);
            var strongholdRules = this.getStrongholdRules(deck.stronghold.length > 0 ? deck.stronghold[0].card : null);
            return this.combineValidationRules([standardRules, factionRules, allianceRules, roleRules, strongholdRules]);
        }
    }, {
        key: 'getFactionRules',
        value: function getFactionRules(faction) {
            return {
                mayInclude: function mayInclude(card) {
                    return card.clan === faction || card.clan === 'neutral';
                }
            };
        }
    }, {
        key: 'getAllianceRules',
        value: function getAllianceRules(clan, faction) {
            return {
                mayInclude: function mayInclude(card) {
                    return card.side === 'conflict' && card.clan === clan && card.allowed_clans.includes(faction);
                }
            };
        }
    }, {
        key: 'getStrongholdRules',
        value: function getStrongholdRules(stronghold) {
            if (!stronghold) {
                return {};
            }
            return {
                influence: stronghold.influence_pool,
                rules: [{
                    message: 'Your stronghold must match your clan',
                    condition: function condition(deck) {
                        return stronghold.clan === deck.faction.value;
                    }
                }]

            };
        }
    }, {
        key: 'getRoleRules',
        value: function getRoleRules(role) {
            if (!role || !roleRules[role.id]) {
                return {};
            }
            return roleRules[role.id];
        }
    }, {
        key: 'combineValidationRules',
        value: function combineValidationRules(validators) {
            var mayIncludeFuncs = _.compact(_.pluck(validators, 'mayInclude'));
            var cannotIncludeFuncs = _.compact(_.pluck(validators, 'cannotInclude'));
            var combinedRules = _.reduce(validators, function (rules, validator) {
                return rules.concat(validator.rules || []);
            }, []);
            var combinedRoles = _.reduce(validators, function (roles, validator) {
                return roles.concat(validator.roleRestrictions || []);
            }, []);
            var totalInfluence = _.reduce(validators, function (total, validator) {
                return total + validator.influence || 0;
            }, 0);
            var maxProvince = _.reduce(validators, function (result, validator) {
                if (validator.maxProvince) {
                    _.each(result, function (amount, element) {
                        return result[element] = amount + (validator.maxProvince[element] || 0);
                    });
                }
                return result;
            }, { air: 0, earth: 0, fire: 0, void: 0, water: 0 });
            var combined = {
                mayInclude: function mayInclude(card) {
                    return _.any(mayIncludeFuncs, function (func) {
                        return func(card);
                    });
                },
                cannotInclude: function cannotInclude(card) {
                    return _.any(cannotIncludeFuncs, function (func) {
                        return func(card);
                    });
                },
                rules: combinedRules,
                roleRestrictions: combinedRoles,
                influence: totalInfluence,
                maxProvince: maxProvince
            };
            return _.extend.apply(_, [{}].concat(_toConsumableArray(validators), [combined]));
        }
    }]);

    return DeckValidator;
}();

module.exports = DeckValidator;