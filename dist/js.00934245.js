// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/parcel-bundler/src/builtins/_empty.js":[function(require,module,exports) {

},{}],"../node_modules/pluralize/pluralize.js":[function(require,module,exports) {
var define;
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function (obj) { return typeof obj; }; } else { _typeof = function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* global define */
(function (root, pluralize) {
  /* istanbul ignore else */
  if (typeof require === 'function' && (typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && (typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object') {
    // Node.
    module.exports = pluralize();
  } else if (typeof define === 'function' && define.amd) {
    // AMD, registers as an anonymous module.
    define(function () {
      return pluralize();
    });
  } else {
    // Browser global.
    root.pluralize = pluralize();
  }
})(this, function () {
  // Rule storage - pluralize and singularize need to be run sequentially,
  // while other rules can be optimized using an object for instant lookups.
  var pluralRules = [];
  var singularRules = [];
  var uncountables = {};
  var irregularPlurals = {};
  var irregularSingles = {};
  /**
   * Sanitize a pluralization rule to a usable regular expression.
   *
   * @param  {(RegExp|string)} rule
   * @return {RegExp}
   */

  function sanitizeRule(rule) {
    if (typeof rule === 'string') {
      return new RegExp('^' + rule + '$', 'i');
    }

    return rule;
  }
  /**
   * Pass in a word token to produce a function that can replicate the case on
   * another word.
   *
   * @param  {string}   word
   * @param  {string}   token
   * @return {Function}
   */


  function restoreCase(word, token) {
    // Tokens are an exact match.
    if (word === token) return token; // Lower cased words. E.g. "hello".

    if (word === word.toLowerCase()) return token.toLowerCase(); // Upper cased words. E.g. "WHISKY".

    if (word === word.toUpperCase()) return token.toUpperCase(); // Title cased words. E.g. "Title".

    if (word[0] === word[0].toUpperCase()) {
      return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
    } // Lower cased words. E.g. "test".


    return token.toLowerCase();
  }
  /**
   * Interpolate a regexp string.
   *
   * @param  {string} str
   * @param  {Array}  args
   * @return {string}
   */


  function interpolate(str, args) {
    return str.replace(/\$(\d{1,2})/g, function (match, index) {
      return args[index] || '';
    });
  }
  /**
   * Replace a word using a rule.
   *
   * @param  {string} word
   * @param  {Array}  rule
   * @return {string}
   */


  function replace(word, rule) {
    return word.replace(rule[0], function (match, index) {
      var result = interpolate(rule[1], arguments);

      if (match === '') {
        return restoreCase(word[index - 1], result);
      }

      return restoreCase(match, result);
    });
  }
  /**
   * Sanitize a word by passing in the word and sanitization rules.
   *
   * @param  {string}   token
   * @param  {string}   word
   * @param  {Array}    rules
   * @return {string}
   */


  function sanitizeWord(token, word, rules) {
    // Empty string or doesn't need fixing.
    if (!token.length || uncountables.hasOwnProperty(token)) {
      return word;
    }

    var len = rules.length; // Iterate over the sanitization rules and use the first one to match.

    while (len--) {
      var rule = rules[len];
      if (rule[0].test(word)) return replace(word, rule);
    }

    return word;
  }
  /**
   * Replace a word with the updated word.
   *
   * @param  {Object}   replaceMap
   * @param  {Object}   keepMap
   * @param  {Array}    rules
   * @return {Function}
   */


  function replaceWord(replaceMap, keepMap, rules) {
    return function (word) {
      // Get the correct token and case restoration functions.
      var token = word.toLowerCase(); // Check against the keep object map.

      if (keepMap.hasOwnProperty(token)) {
        return restoreCase(word, token);
      } // Check against the replacement map for a direct word replacement.


      if (replaceMap.hasOwnProperty(token)) {
        return restoreCase(word, replaceMap[token]);
      } // Run all the rules against the word.


      return sanitizeWord(token, word, rules);
    };
  }
  /**
   * Check if a word is part of the map.
   */


  function checkWord(replaceMap, keepMap, rules, bool) {
    return function (word) {
      var token = word.toLowerCase();
      if (keepMap.hasOwnProperty(token)) return true;
      if (replaceMap.hasOwnProperty(token)) return false;
      return sanitizeWord(token, token, rules) === token;
    };
  }
  /**
   * Pluralize or singularize a word based on the passed in count.
   *
   * @param  {string}  word      The word to pluralize
   * @param  {number}  count     How many of the word exist
   * @param  {boolean} inclusive Whether to prefix with the number (e.g. 3 ducks)
   * @return {string}
   */


  function pluralize(word, count, inclusive) {
    var pluralized = count === 1 ? pluralize.singular(word) : pluralize.plural(word);
    return (inclusive ? count + ' ' : '') + pluralized;
  }
  /**
   * Pluralize a word.
   *
   * @type {Function}
   */


  pluralize.plural = replaceWord(irregularSingles, irregularPlurals, pluralRules);
  /**
   * Check if a word is plural.
   *
   * @type {Function}
   */

  pluralize.isPlural = checkWord(irregularSingles, irregularPlurals, pluralRules);
  /**
   * Singularize a word.
   *
   * @type {Function}
   */

  pluralize.singular = replaceWord(irregularPlurals, irregularSingles, singularRules);
  /**
   * Check if a word is singular.
   *
   * @type {Function}
   */

  pluralize.isSingular = checkWord(irregularPlurals, irregularSingles, singularRules);
  /**
   * Add a pluralization rule to the collection.
   *
   * @param {(string|RegExp)} rule
   * @param {string}          replacement
   */

  pluralize.addPluralRule = function (rule, replacement) {
    pluralRules.push([sanitizeRule(rule), replacement]);
  };
  /**
   * Add a singularization rule to the collection.
   *
   * @param {(string|RegExp)} rule
   * @param {string}          replacement
   */


  pluralize.addSingularRule = function (rule, replacement) {
    singularRules.push([sanitizeRule(rule), replacement]);
  };
  /**
   * Add an uncountable word rule.
   *
   * @param {(string|RegExp)} word
   */


  pluralize.addUncountableRule = function (word) {
    if (typeof word === 'string') {
      uncountables[word.toLowerCase()] = true;
      return;
    } // Set singular and plural references for the word.


    pluralize.addPluralRule(word, '$0');
    pluralize.addSingularRule(word, '$0');
  };
  /**
   * Add an irregular word definition.
   *
   * @param {string} single
   * @param {string} plural
   */


  pluralize.addIrregularRule = function (single, plural) {
    plural = plural.toLowerCase();
    single = single.toLowerCase();
    irregularSingles[single] = plural;
    irregularPlurals[plural] = single;
  };
  /**
   * Irregular rules.
   */


  [// Pronouns.
  ['I', 'we'], ['me', 'us'], ['he', 'they'], ['she', 'they'], ['them', 'them'], ['myself', 'ourselves'], ['yourself', 'yourselves'], ['itself', 'themselves'], ['herself', 'themselves'], ['himself', 'themselves'], ['themself', 'themselves'], ['is', 'are'], ['was', 'were'], ['has', 'have'], ['this', 'these'], ['that', 'those'], // Words ending in with a consonant and `o`.
  ['echo', 'echoes'], ['dingo', 'dingoes'], ['volcano', 'volcanoes'], ['tornado', 'tornadoes'], ['torpedo', 'torpedoes'], // Ends with `us`.
  ['genus', 'genera'], ['viscus', 'viscera'], // Ends with `ma`.
  ['stigma', 'stigmata'], ['stoma', 'stomata'], ['dogma', 'dogmata'], ['lemma', 'lemmata'], ['schema', 'schemata'], ['anathema', 'anathemata'], // Other irregular rules.
  ['ox', 'oxen'], ['axe', 'axes'], ['die', 'dice'], ['yes', 'yeses'], ['foot', 'feet'], ['eave', 'eaves'], ['goose', 'geese'], ['tooth', 'teeth'], ['quiz', 'quizzes'], ['human', 'humans'], ['proof', 'proofs'], ['carve', 'carves'], ['valve', 'valves'], ['looey', 'looies'], ['thief', 'thieves'], ['groove', 'grooves'], ['pickaxe', 'pickaxes'], ['passerby', 'passersby']].forEach(function (rule) {
    return pluralize.addIrregularRule(rule[0], rule[1]);
  });
  /**
   * Pluralization rules.
   */

  [[/s?$/i, 's'], [/[^\u0000-\u007F]$/i, '$0'], [/([^aeiou]ese)$/i, '$1'], [/(ax|test)is$/i, '$1es'], [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, '$1es'], [/(e[mn]u)s?$/i, '$1s'], [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, '$1'], [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1i'], [/(alumn|alg|vertebr)(?:a|ae)$/i, '$1ae'], [/(seraph|cherub)(?:im)?$/i, '$1im'], [/(her|at|gr)o$/i, '$1oes'], [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, '$1a'], [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, '$1a'], [/sis$/i, 'ses'], [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, '$1$2ves'], [/([^aeiouy]|qu)y$/i, '$1ies'], [/([^ch][ieo][ln])ey$/i, '$1ies'], [/(x|ch|ss|sh|zz)$/i, '$1es'], [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, '$1ices'], [/\b((?:tit)?m|l)(?:ice|ouse)$/i, '$1ice'], [/(pe)(?:rson|ople)$/i, '$1ople'], [/(child)(?:ren)?$/i, '$1ren'], [/eaux$/i, '$0'], [/m[ae]n$/i, 'men'], ['thou', 'you']].forEach(function (rule) {
    return pluralize.addPluralRule(rule[0], rule[1]);
  });
  /**
   * Singularization rules.
   */

  [[/s$/i, ''], [/(ss)$/i, '$1'], [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, '$1fe'], [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, '$1f'], [/ies$/i, 'y'], [/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i, '$1ie'], [/\b(mon|smil)ies$/i, '$1ey'], [/\b((?:tit)?m|l)ice$/i, '$1ouse'], [/(seraph|cherub)im$/i, '$1'], [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, '$1'], [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, '$1sis'], [/(movie|twelve|abuse|e[mn]u)s$/i, '$1'], [/(test)(?:is|es)$/i, '$1is'], [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1us'], [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, '$1um'], [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, '$1on'], [/(alumn|alg|vertebr)ae$/i, '$1a'], [/(cod|mur|sil|vert|ind)ices$/i, '$1ex'], [/(matr|append)ices$/i, '$1ix'], [/(pe)(rson|ople)$/i, '$1rson'], [/(child)ren$/i, '$1'], [/(eau)x?$/i, '$1'], [/men$/i, 'man']].forEach(function (rule) {
    return pluralize.addSingularRule(rule[0], rule[1]);
  });
  /**
   * Uncountable rules.
   */

  [// Singular words with no plurals.
  'adulthood', 'advice', 'agenda', 'aid', 'aircraft', 'alcohol', 'ammo', 'analytics', 'anime', 'athletics', 'audio', 'bison', 'blood', 'bream', 'buffalo', 'butter', 'carp', 'cash', 'chassis', 'chess', 'clothing', 'cod', 'commerce', 'cooperation', 'corps', 'debris', 'diabetes', 'digestion', 'elk', 'energy', 'equipment', 'excretion', 'expertise', 'firmware', 'flounder', 'fun', 'gallows', 'garbage', 'graffiti', 'hardware', 'headquarters', 'health', 'herpes', 'highjinks', 'homework', 'housework', 'information', 'jeans', 'justice', 'kudos', 'labour', 'literature', 'machinery', 'mackerel', 'mail', 'media', 'mews', 'moose', 'music', 'mud', 'manga', 'news', 'only', 'personnel', 'pike', 'plankton', 'pliers', 'police', 'pollution', 'premises', 'rain', 'research', 'rice', 'salmon', 'scissors', 'series', 'sewage', 'shambles', 'shrimp', 'software', 'species', 'staff', 'swine', 'tennis', 'traffic', 'transportation', 'trout', 'tuna', 'wealth', 'welfare', 'whiting', 'wildebeest', 'wildlife', 'you', /pok[eé]mon$/i, // Regexes.
  /[^aeiou]ese$/i, // "chinese", "japanese"
  /deer$/i, // "deer", "reindeer"
  /fish$/i, // "fish", "blowfish", "angelfish"
  /measles$/i, /o[iu]s$/i, // "carnivorous"
  /pox$/i, // "chickpox", "smallpox"
  /sheep$/i].forEach(pluralize.addUncountableRule);
  return pluralize;
});
},{}],"../node_modules/number-names/lib/cache.js":[function(require,module,exports) {
SUB_ONE_THOUSAND = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'twenty-one', 'twenty-two', 'twenty-three', 'twenty-four', 'twenty-five', 'twenty-six', 'twenty-seven', 'twenty-eight', 'twenty-nine', 'thirty', 'thirty-one', 'thirty-two', 'thirty-three', 'thirty-four', 'thirty-five', 'thirty-six', 'thirty-seven', 'thirty-eight', 'thirty-nine', 'forty', 'forty-one', 'forty-two', 'forty-three', 'forty-four', 'forty-five', 'forty-six', 'forty-seven', 'forty-eight', 'forty-nine', 'fifty', 'fifty-one', 'fifty-two', 'fifty-three', 'fifty-four', 'fifty-five', 'fifty-six', 'fifty-seven', 'fifty-eight', 'fifty-nine', 'sixty', 'sixty-one', 'sixty-two', 'sixty-three', 'sixty-four', 'sixty-five', 'sixty-six', 'sixty-seven', 'sixty-eight', 'sixty-nine', 'seventy', 'seventy-one', 'seventy-two', 'seventy-three', 'seventy-four', 'seventy-five', 'seventy-six', 'seventy-seven', 'seventy-eight', 'seventy-nine', 'eighty', 'eighty-one', 'eighty-two', 'eighty-three', 'eighty-four', 'eighty-five', 'eighty-six', 'eighty-seven', 'eighty-eight', 'eighty-nine', 'ninety', 'ninety-one', 'ninety-two', 'ninety-three', 'ninety-four', 'ninety-five', 'ninety-six', 'ninety-seven', 'ninety-eight', 'ninety-nine', 'one hundred', 'one hundred and one', 'one hundred and two', 'one hundred and three', 'one hundred and four', 'one hundred and five', 'one hundred and six', 'one hundred and seven', 'one hundred and eight', 'one hundred and nine', 'one hundred and ten', 'one hundred and eleven', 'one hundred and twelve', 'one hundred and thirteen', 'one hundred and fourteen', 'one hundred and fifteen', 'one hundred and sixteen', 'one hundred and seventeen', 'one hundred and eighteen', 'one hundred and nineteen', 'one hundred and twenty', 'one hundred and twenty-one', 'one hundred and twenty-two', 'one hundred and twenty-three', 'one hundred and twenty-four', 'one hundred and twenty-five', 'one hundred and twenty-six', 'one hundred and twenty-seven', 'one hundred and twenty-eight', 'one hundred and twenty-nine', 'one hundred and thirty', 'one hundred and thirty-one', 'one hundred and thirty-two', 'one hundred and thirty-three', 'one hundred and thirty-four', 'one hundred and thirty-five', 'one hundred and thirty-six', 'one hundred and thirty-seven', 'one hundred and thirty-eight', 'one hundred and thirty-nine', 'one hundred and forty', 'one hundred and forty-one', 'one hundred and forty-two', 'one hundred and forty-three', 'one hundred and forty-four', 'one hundred and forty-five', 'one hundred and forty-six', 'one hundred and forty-seven', 'one hundred and forty-eight', 'one hundred and forty-nine', 'one hundred and fifty', 'one hundred and fifty-one', 'one hundred and fifty-two', 'one hundred and fifty-three', 'one hundred and fifty-four', 'one hundred and fifty-five', 'one hundred and fifty-six', 'one hundred and fifty-seven', 'one hundred and fifty-eight', 'one hundred and fifty-nine', 'one hundred and sixty', 'one hundred and sixty-one', 'one hundred and sixty-two', 'one hundred and sixty-three', 'one hundred and sixty-four', 'one hundred and sixty-five', 'one hundred and sixty-six', 'one hundred and sixty-seven', 'one hundred and sixty-eight', 'one hundred and sixty-nine', 'one hundred and seventy', 'one hundred and seventy-one', 'one hundred and seventy-two', 'one hundred and seventy-three', 'one hundred and seventy-four', 'one hundred and seventy-five', 'one hundred and seventy-six', 'one hundred and seventy-seven', 'one hundred and seventy-eight', 'one hundred and seventy-nine', 'one hundred and eighty', 'one hundred and eighty-one', 'one hundred and eighty-two', 'one hundred and eighty-three', 'one hundred and eighty-four', 'one hundred and eighty-five', 'one hundred and eighty-six', 'one hundred and eighty-seven', 'one hundred and eighty-eight', 'one hundred and eighty-nine', 'one hundred and ninety', 'one hundred and ninety-one', 'one hundred and ninety-two', 'one hundred and ninety-three', 'one hundred and ninety-four', 'one hundred and ninety-five', 'one hundred and ninety-six', 'one hundred and ninety-seven', 'one hundred and ninety-eight', 'one hundred and ninety-nine', 'two hundred', 'two hundred and one', 'two hundred and two', 'two hundred and three', 'two hundred and four', 'two hundred and five', 'two hundred and six', 'two hundred and seven', 'two hundred and eight', 'two hundred and nine', 'two hundred and ten', 'two hundred and eleven', 'two hundred and twelve', 'two hundred and thirteen', 'two hundred and fourteen', 'two hundred and fifteen', 'two hundred and sixteen', 'two hundred and seventeen', 'two hundred and eighteen', 'two hundred and nineteen', 'two hundred and twenty', 'two hundred and twenty-one', 'two hundred and twenty-two', 'two hundred and twenty-three', 'two hundred and twenty-four', 'two hundred and twenty-five', 'two hundred and twenty-six', 'two hundred and twenty-seven', 'two hundred and twenty-eight', 'two hundred and twenty-nine', 'two hundred and thirty', 'two hundred and thirty-one', 'two hundred and thirty-two', 'two hundred and thirty-three', 'two hundred and thirty-four', 'two hundred and thirty-five', 'two hundred and thirty-six', 'two hundred and thirty-seven', 'two hundred and thirty-eight', 'two hundred and thirty-nine', 'two hundred and forty', 'two hundred and forty-one', 'two hundred and forty-two', 'two hundred and forty-three', 'two hundred and forty-four', 'two hundred and forty-five', 'two hundred and forty-six', 'two hundred and forty-seven', 'two hundred and forty-eight', 'two hundred and forty-nine', 'two hundred and fifty', 'two hundred and fifty-one', 'two hundred and fifty-two', 'two hundred and fifty-three', 'two hundred and fifty-four', 'two hundred and fifty-five', 'two hundred and fifty-six', 'two hundred and fifty-seven', 'two hundred and fifty-eight', 'two hundred and fifty-nine', 'two hundred and sixty', 'two hundred and sixty-one', 'two hundred and sixty-two', 'two hundred and sixty-three', 'two hundred and sixty-four', 'two hundred and sixty-five', 'two hundred and sixty-six', 'two hundred and sixty-seven', 'two hundred and sixty-eight', 'two hundred and sixty-nine', 'two hundred and seventy', 'two hundred and seventy-one', 'two hundred and seventy-two', 'two hundred and seventy-three', 'two hundred and seventy-four', 'two hundred and seventy-five', 'two hundred and seventy-six', 'two hundred and seventy-seven', 'two hundred and seventy-eight', 'two hundred and seventy-nine', 'two hundred and eighty', 'two hundred and eighty-one', 'two hundred and eighty-two', 'two hundred and eighty-three', 'two hundred and eighty-four', 'two hundred and eighty-five', 'two hundred and eighty-six', 'two hundred and eighty-seven', 'two hundred and eighty-eight', 'two hundred and eighty-nine', 'two hundred and ninety', 'two hundred and ninety-one', 'two hundred and ninety-two', 'two hundred and ninety-three', 'two hundred and ninety-four', 'two hundred and ninety-five', 'two hundred and ninety-six', 'two hundred and ninety-seven', 'two hundred and ninety-eight', 'two hundred and ninety-nine', 'three hundred', 'three hundred and one', 'three hundred and two', 'three hundred and three', 'three hundred and four', 'three hundred and five', 'three hundred and six', 'three hundred and seven', 'three hundred and eight', 'three hundred and nine', 'three hundred and ten', 'three hundred and eleven', 'three hundred and twelve', 'three hundred and thirteen', 'three hundred and fourteen', 'three hundred and fifteen', 'three hundred and sixteen', 'three hundred and seventeen', 'three hundred and eighteen', 'three hundred and nineteen', 'three hundred and twenty', 'three hundred and twenty-one', 'three hundred and twenty-two', 'three hundred and twenty-three', 'three hundred and twenty-four', 'three hundred and twenty-five', 'three hundred and twenty-six', 'three hundred and twenty-seven', 'three hundred and twenty-eight', 'three hundred and twenty-nine', 'three hundred and thirty', 'three hundred and thirty-one', 'three hundred and thirty-two', 'three hundred and thirty-three', 'three hundred and thirty-four', 'three hundred and thirty-five', 'three hundred and thirty-six', 'three hundred and thirty-seven', 'three hundred and thirty-eight', 'three hundred and thirty-nine', 'three hundred and forty', 'three hundred and forty-one', 'three hundred and forty-two', 'three hundred and forty-three', 'three hundred and forty-four', 'three hundred and forty-five', 'three hundred and forty-six', 'three hundred and forty-seven', 'three hundred and forty-eight', 'three hundred and forty-nine', 'three hundred and fifty', 'three hundred and fifty-one', 'three hundred and fifty-two', 'three hundred and fifty-three', 'three hundred and fifty-four', 'three hundred and fifty-five', 'three hundred and fifty-six', 'three hundred and fifty-seven', 'three hundred and fifty-eight', 'three hundred and fifty-nine', 'three hundred and sixty', 'three hundred and sixty-one', 'three hundred and sixty-two', 'three hundred and sixty-three', 'three hundred and sixty-four', 'three hundred and sixty-five', 'three hundred and sixty-six', 'three hundred and sixty-seven', 'three hundred and sixty-eight', 'three hundred and sixty-nine', 'three hundred and seventy', 'three hundred and seventy-one', 'three hundred and seventy-two', 'three hundred and seventy-three', 'three hundred and seventy-four', 'three hundred and seventy-five', 'three hundred and seventy-six', 'three hundred and seventy-seven', 'three hundred and seventy-eight', 'three hundred and seventy-nine', 'three hundred and eighty', 'three hundred and eighty-one', 'three hundred and eighty-two', 'three hundred and eighty-three', 'three hundred and eighty-four', 'three hundred and eighty-five', 'three hundred and eighty-six', 'three hundred and eighty-seven', 'three hundred and eighty-eight', 'three hundred and eighty-nine', 'three hundred and ninety', 'three hundred and ninety-one', 'three hundred and ninety-two', 'three hundred and ninety-three', 'three hundred and ninety-four', 'three hundred and ninety-five', 'three hundred and ninety-six', 'three hundred and ninety-seven', 'three hundred and ninety-eight', 'three hundred and ninety-nine', 'four hundred', 'four hundred and one', 'four hundred and two', 'four hundred and three', 'four hundred and four', 'four hundred and five', 'four hundred and six', 'four hundred and seven', 'four hundred and eight', 'four hundred and nine', 'four hundred and ten', 'four hundred and eleven', 'four hundred and twelve', 'four hundred and thirteen', 'four hundred and fourteen', 'four hundred and fifteen', 'four hundred and sixteen', 'four hundred and seventeen', 'four hundred and eighteen', 'four hundred and nineteen', 'four hundred and twenty', 'four hundred and twenty-one', 'four hundred and twenty-two', 'four hundred and twenty-three', 'four hundred and twenty-four', 'four hundred and twenty-five', 'four hundred and twenty-six', 'four hundred and twenty-seven', 'four hundred and twenty-eight', 'four hundred and twenty-nine', 'four hundred and thirty', 'four hundred and thirty-one', 'four hundred and thirty-two', 'four hundred and thirty-three', 'four hundred and thirty-four', 'four hundred and thirty-five', 'four hundred and thirty-six', 'four hundred and thirty-seven', 'four hundred and thirty-eight', 'four hundred and thirty-nine', 'four hundred and forty', 'four hundred and forty-one', 'four hundred and forty-two', 'four hundred and forty-three', 'four hundred and forty-four', 'four hundred and forty-five', 'four hundred and forty-six', 'four hundred and forty-seven', 'four hundred and forty-eight', 'four hundred and forty-nine', 'four hundred and fifty', 'four hundred and fifty-one', 'four hundred and fifty-two', 'four hundred and fifty-three', 'four hundred and fifty-four', 'four hundred and fifty-five', 'four hundred and fifty-six', 'four hundred and fifty-seven', 'four hundred and fifty-eight', 'four hundred and fifty-nine', 'four hundred and sixty', 'four hundred and sixty-one', 'four hundred and sixty-two', 'four hundred and sixty-three', 'four hundred and sixty-four', 'four hundred and sixty-five', 'four hundred and sixty-six', 'four hundred and sixty-seven', 'four hundred and sixty-eight', 'four hundred and sixty-nine', 'four hundred and seventy', 'four hundred and seventy-one', 'four hundred and seventy-two', 'four hundred and seventy-three', 'four hundred and seventy-four', 'four hundred and seventy-five', 'four hundred and seventy-six', 'four hundred and seventy-seven', 'four hundred and seventy-eight', 'four hundred and seventy-nine', 'four hundred and eighty', 'four hundred and eighty-one', 'four hundred and eighty-two', 'four hundred and eighty-three', 'four hundred and eighty-four', 'four hundred and eighty-five', 'four hundred and eighty-six', 'four hundred and eighty-seven', 'four hundred and eighty-eight', 'four hundred and eighty-nine', 'four hundred and ninety', 'four hundred and ninety-one', 'four hundred and ninety-two', 'four hundred and ninety-three', 'four hundred and ninety-four', 'four hundred and ninety-five', 'four hundred and ninety-six', 'four hundred and ninety-seven', 'four hundred and ninety-eight', 'four hundred and ninety-nine', 'five hundred', 'five hundred and one', 'five hundred and two', 'five hundred and three', 'five hundred and four', 'five hundred and five', 'five hundred and six', 'five hundred and seven', 'five hundred and eight', 'five hundred and nine', 'five hundred and ten', 'five hundred and eleven', 'five hundred and twelve', 'five hundred and thirteen', 'five hundred and fourteen', 'five hundred and fifteen', 'five hundred and sixteen', 'five hundred and seventeen', 'five hundred and eighteen', 'five hundred and nineteen', 'five hundred and twenty', 'five hundred and twenty-one', 'five hundred and twenty-two', 'five hundred and twenty-three', 'five hundred and twenty-four', 'five hundred and twenty-five', 'five hundred and twenty-six', 'five hundred and twenty-seven', 'five hundred and twenty-eight', 'five hundred and twenty-nine', 'five hundred and thirty', 'five hundred and thirty-one', 'five hundred and thirty-two', 'five hundred and thirty-three', 'five hundred and thirty-four', 'five hundred and thirty-five', 'five hundred and thirty-six', 'five hundred and thirty-seven', 'five hundred and thirty-eight', 'five hundred and thirty-nine', 'five hundred and forty', 'five hundred and forty-one', 'five hundred and forty-two', 'five hundred and forty-three', 'five hundred and forty-four', 'five hundred and forty-five', 'five hundred and forty-six', 'five hundred and forty-seven', 'five hundred and forty-eight', 'five hundred and forty-nine', 'five hundred and fifty', 'five hundred and fifty-one', 'five hundred and fifty-two', 'five hundred and fifty-three', 'five hundred and fifty-four', 'five hundred and fifty-five', 'five hundred and fifty-six', 'five hundred and fifty-seven', 'five hundred and fifty-eight', 'five hundred and fifty-nine', 'five hundred and sixty', 'five hundred and sixty-one', 'five hundred and sixty-two', 'five hundred and sixty-three', 'five hundred and sixty-four', 'five hundred and sixty-five', 'five hundred and sixty-six', 'five hundred and sixty-seven', 'five hundred and sixty-eight', 'five hundred and sixty-nine', 'five hundred and seventy', 'five hundred and seventy-one', 'five hundred and seventy-two', 'five hundred and seventy-three', 'five hundred and seventy-four', 'five hundred and seventy-five', 'five hundred and seventy-six', 'five hundred and seventy-seven', 'five hundred and seventy-eight', 'five hundred and seventy-nine', 'five hundred and eighty', 'five hundred and eighty-one', 'five hundred and eighty-two', 'five hundred and eighty-three', 'five hundred and eighty-four', 'five hundred and eighty-five', 'five hundred and eighty-six', 'five hundred and eighty-seven', 'five hundred and eighty-eight', 'five hundred and eighty-nine', 'five hundred and ninety', 'five hundred and ninety-one', 'five hundred and ninety-two', 'five hundred and ninety-three', 'five hundred and ninety-four', 'five hundred and ninety-five', 'five hundred and ninety-six', 'five hundred and ninety-seven', 'five hundred and ninety-eight', 'five hundred and ninety-nine', 'six hundred', 'six hundred and one', 'six hundred and two', 'six hundred and three', 'six hundred and four', 'six hundred and five', 'six hundred and six', 'six hundred and seven', 'six hundred and eight', 'six hundred and nine', 'six hundred and ten', 'six hundred and eleven', 'six hundred and twelve', 'six hundred and thirteen', 'six hundred and fourteen', 'six hundred and fifteen', 'six hundred and sixteen', 'six hundred and seventeen', 'six hundred and eighteen', 'six hundred and nineteen', 'six hundred and twenty', 'six hundred and twenty-one', 'six hundred and twenty-two', 'six hundred and twenty-three', 'six hundred and twenty-four', 'six hundred and twenty-five', 'six hundred and twenty-six', 'six hundred and twenty-seven', 'six hundred and twenty-eight', 'six hundred and twenty-nine', 'six hundred and thirty', 'six hundred and thirty-one', 'six hundred and thirty-two', 'six hundred and thirty-three', 'six hundred and thirty-four', 'six hundred and thirty-five', 'six hundred and thirty-six', 'six hundred and thirty-seven', 'six hundred and thirty-eight', 'six hundred and thirty-nine', 'six hundred and forty', 'six hundred and forty-one', 'six hundred and forty-two', 'six hundred and forty-three', 'six hundred and forty-four', 'six hundred and forty-five', 'six hundred and forty-six', 'six hundred and forty-seven', 'six hundred and forty-eight', 'six hundred and forty-nine', 'six hundred and fifty', 'six hundred and fifty-one', 'six hundred and fifty-two', 'six hundred and fifty-three', 'six hundred and fifty-four', 'six hundred and fifty-five', 'six hundred and fifty-six', 'six hundred and fifty-seven', 'six hundred and fifty-eight', 'six hundred and fifty-nine', 'six hundred and sixty', 'six hundred and sixty-one', 'six hundred and sixty-two', 'six hundred and sixty-three', 'six hundred and sixty-four', 'six hundred and sixty-five', 'six hundred and sixty-six', 'six hundred and sixty-seven', 'six hundred and sixty-eight', 'six hundred and sixty-nine', 'six hundred and seventy', 'six hundred and seventy-one', 'six hundred and seventy-two', 'six hundred and seventy-three', 'six hundred and seventy-four', 'six hundred and seventy-five', 'six hundred and seventy-six', 'six hundred and seventy-seven', 'six hundred and seventy-eight', 'six hundred and seventy-nine', 'six hundred and eighty', 'six hundred and eighty-one', 'six hundred and eighty-two', 'six hundred and eighty-three', 'six hundred and eighty-four', 'six hundred and eighty-five', 'six hundred and eighty-six', 'six hundred and eighty-seven', 'six hundred and eighty-eight', 'six hundred and eighty-nine', 'six hundred and ninety', 'six hundred and ninety-one', 'six hundred and ninety-two', 'six hundred and ninety-three', 'six hundred and ninety-four', 'six hundred and ninety-five', 'six hundred and ninety-six', 'six hundred and ninety-seven', 'six hundred and ninety-eight', 'six hundred and ninety-nine', 'seven hundred', 'seven hundred and one', 'seven hundred and two', 'seven hundred and three', 'seven hundred and four', 'seven hundred and five', 'seven hundred and six', 'seven hundred and seven', 'seven hundred and eight', 'seven hundred and nine', 'seven hundred and ten', 'seven hundred and eleven', 'seven hundred and twelve', 'seven hundred and thirteen', 'seven hundred and fourteen', 'seven hundred and fifteen', 'seven hundred and sixteen', 'seven hundred and seventeen', 'seven hundred and eighteen', 'seven hundred and nineteen', 'seven hundred and twenty', 'seven hundred and twenty-one', 'seven hundred and twenty-two', 'seven hundred and twenty-three', 'seven hundred and twenty-four', 'seven hundred and twenty-five', 'seven hundred and twenty-six', 'seven hundred and twenty-seven', 'seven hundred and twenty-eight', 'seven hundred and twenty-nine', 'seven hundred and thirty', 'seven hundred and thirty-one', 'seven hundred and thirty-two', 'seven hundred and thirty-three', 'seven hundred and thirty-four', 'seven hundred and thirty-five', 'seven hundred and thirty-six', 'seven hundred and thirty-seven', 'seven hundred and thirty-eight', 'seven hundred and thirty-nine', 'seven hundred and forty', 'seven hundred and forty-one', 'seven hundred and forty-two', 'seven hundred and forty-three', 'seven hundred and forty-four', 'seven hundred and forty-five', 'seven hundred and forty-six', 'seven hundred and forty-seven', 'seven hundred and forty-eight', 'seven hundred and forty-nine', 'seven hundred and fifty', 'seven hundred and fifty-one', 'seven hundred and fifty-two', 'seven hundred and fifty-three', 'seven hundred and fifty-four', 'seven hundred and fifty-five', 'seven hundred and fifty-six', 'seven hundred and fifty-seven', 'seven hundred and fifty-eight', 'seven hundred and fifty-nine', 'seven hundred and sixty', 'seven hundred and sixty-one', 'seven hundred and sixty-two', 'seven hundred and sixty-three', 'seven hundred and sixty-four', 'seven hundred and sixty-five', 'seven hundred and sixty-six', 'seven hundred and sixty-seven', 'seven hundred and sixty-eight', 'seven hundred and sixty-nine', 'seven hundred and seventy', 'seven hundred and seventy-one', 'seven hundred and seventy-two', 'seven hundred and seventy-three', 'seven hundred and seventy-four', 'seven hundred and seventy-five', 'seven hundred and seventy-six', 'seven hundred and seventy-seven', 'seven hundred and seventy-eight', 'seven hundred and seventy-nine', 'seven hundred and eighty', 'seven hundred and eighty-one', 'seven hundred and eighty-two', 'seven hundred and eighty-three', 'seven hundred and eighty-four', 'seven hundred and eighty-five', 'seven hundred and eighty-six', 'seven hundred and eighty-seven', 'seven hundred and eighty-eight', 'seven hundred and eighty-nine', 'seven hundred and ninety', 'seven hundred and ninety-one', 'seven hundred and ninety-two', 'seven hundred and ninety-three', 'seven hundred and ninety-four', 'seven hundred and ninety-five', 'seven hundred and ninety-six', 'seven hundred and ninety-seven', 'seven hundred and ninety-eight', 'seven hundred and ninety-nine', 'eight hundred', 'eight hundred and one', 'eight hundred and two', 'eight hundred and three', 'eight hundred and four', 'eight hundred and five', 'eight hundred and six', 'eight hundred and seven', 'eight hundred and eight', 'eight hundred and nine', 'eight hundred and ten', 'eight hundred and eleven', 'eight hundred and twelve', 'eight hundred and thirteen', 'eight hundred and fourteen', 'eight hundred and fifteen', 'eight hundred and sixteen', 'eight hundred and seventeen', 'eight hundred and eighteen', 'eight hundred and nineteen', 'eight hundred and twenty', 'eight hundred and twenty-one', 'eight hundred and twenty-two', 'eight hundred and twenty-three', 'eight hundred and twenty-four', 'eight hundred and twenty-five', 'eight hundred and twenty-six', 'eight hundred and twenty-seven', 'eight hundred and twenty-eight', 'eight hundred and twenty-nine', 'eight hundred and thirty', 'eight hundred and thirty-one', 'eight hundred and thirty-two', 'eight hundred and thirty-three', 'eight hundred and thirty-four', 'eight hundred and thirty-five', 'eight hundred and thirty-six', 'eight hundred and thirty-seven', 'eight hundred and thirty-eight', 'eight hundred and thirty-nine', 'eight hundred and forty', 'eight hundred and forty-one', 'eight hundred and forty-two', 'eight hundred and forty-three', 'eight hundred and forty-four', 'eight hundred and forty-five', 'eight hundred and forty-six', 'eight hundred and forty-seven', 'eight hundred and forty-eight', 'eight hundred and forty-nine', 'eight hundred and fifty', 'eight hundred and fifty-one', 'eight hundred and fifty-two', 'eight hundred and fifty-three', 'eight hundred and fifty-four', 'eight hundred and fifty-five', 'eight hundred and fifty-six', 'eight hundred and fifty-seven', 'eight hundred and fifty-eight', 'eight hundred and fifty-nine', 'eight hundred and sixty', 'eight hundred and sixty-one', 'eight hundred and sixty-two', 'eight hundred and sixty-three', 'eight hundred and sixty-four', 'eight hundred and sixty-five', 'eight hundred and sixty-six', 'eight hundred and sixty-seven', 'eight hundred and sixty-eight', 'eight hundred and sixty-nine', 'eight hundred and seventy', 'eight hundred and seventy-one', 'eight hundred and seventy-two', 'eight hundred and seventy-three', 'eight hundred and seventy-four', 'eight hundred and seventy-five', 'eight hundred and seventy-six', 'eight hundred and seventy-seven', 'eight hundred and seventy-eight', 'eight hundred and seventy-nine', 'eight hundred and eighty', 'eight hundred and eighty-one', 'eight hundred and eighty-two', 'eight hundred and eighty-three', 'eight hundred and eighty-four', 'eight hundred and eighty-five', 'eight hundred and eighty-six', 'eight hundred and eighty-seven', 'eight hundred and eighty-eight', 'eight hundred and eighty-nine', 'eight hundred and ninety', 'eight hundred and ninety-one', 'eight hundred and ninety-two', 'eight hundred and ninety-three', 'eight hundred and ninety-four', 'eight hundred and ninety-five', 'eight hundred and ninety-six', 'eight hundred and ninety-seven', 'eight hundred and ninety-eight', 'eight hundred and ninety-nine', 'nine hundred', 'nine hundred and one', 'nine hundred and two', 'nine hundred and three', 'nine hundred and four', 'nine hundred and five', 'nine hundred and six', 'nine hundred and seven', 'nine hundred and eight', 'nine hundred and nine', 'nine hundred and ten', 'nine hundred and eleven', 'nine hundred and twelve', 'nine hundred and thirteen', 'nine hundred and fourteen', 'nine hundred and fifteen', 'nine hundred and sixteen', 'nine hundred and seventeen', 'nine hundred and eighteen', 'nine hundred and nineteen', 'nine hundred and twenty', 'nine hundred and twenty-one', 'nine hundred and twenty-two', 'nine hundred and twenty-three', 'nine hundred and twenty-four', 'nine hundred and twenty-five', 'nine hundred and twenty-six', 'nine hundred and twenty-seven', 'nine hundred and twenty-eight', 'nine hundred and twenty-nine', 'nine hundred and thirty', 'nine hundred and thirty-one', 'nine hundred and thirty-two', 'nine hundred and thirty-three', 'nine hundred and thirty-four', 'nine hundred and thirty-five', 'nine hundred and thirty-six', 'nine hundred and thirty-seven', 'nine hundred and thirty-eight', 'nine hundred and thirty-nine', 'nine hundred and forty', 'nine hundred and forty-one', 'nine hundred and forty-two', 'nine hundred and forty-three', 'nine hundred and forty-four', 'nine hundred and forty-five', 'nine hundred and forty-six', 'nine hundred and forty-seven', 'nine hundred and forty-eight', 'nine hundred and forty-nine', 'nine hundred and fifty', 'nine hundred and fifty-one', 'nine hundred and fifty-two', 'nine hundred and fifty-three', 'nine hundred and fifty-four', 'nine hundred and fifty-five', 'nine hundred and fifty-six', 'nine hundred and fifty-seven', 'nine hundred and fifty-eight', 'nine hundred and fifty-nine', 'nine hundred and sixty', 'nine hundred and sixty-one', 'nine hundred and sixty-two', 'nine hundred and sixty-three', 'nine hundred and sixty-four', 'nine hundred and sixty-five', 'nine hundred and sixty-six', 'nine hundred and sixty-seven', 'nine hundred and sixty-eight', 'nine hundred and sixty-nine', 'nine hundred and seventy', 'nine hundred and seventy-one', 'nine hundred and seventy-two', 'nine hundred and seventy-three', 'nine hundred and seventy-four', 'nine hundred and seventy-five', 'nine hundred and seventy-six', 'nine hundred and seventy-seven', 'nine hundred and seventy-eight', 'nine hundred and seventy-nine', 'nine hundred and eighty', 'nine hundred and eighty-one', 'nine hundred and eighty-two', 'nine hundred and eighty-three', 'nine hundred and eighty-four', 'nine hundred and eighty-five', 'nine hundred and eighty-six', 'nine hundred and eighty-seven', 'nine hundred and eighty-eight', 'nine hundred and eighty-nine', 'nine hundred and ninety', 'nine hundred and ninety-one', 'nine hundred and ninety-two', 'nine hundred and ninety-three', 'nine hundred and ninety-four', 'nine hundred and ninety-five', 'nine hundred and ninety-six', 'nine hundred and ninety-seven', 'nine hundred and ninety-eight', 'nine hundred and ninety-nine']
module.exports = SUB_ONE_THOUSAND; 

},{}],"../node_modules/number-names/lib/lots.js":[function(require,module,exports) {
LOTS = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintrillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quattuordecillion', 'quindecillion', 'sexdecillion', 'septendecillion', 'octodecillion', 'novemdecillion', 'vigintillion', 'unvigintillion', 'duovigintillion', 'trevigintillion', 'quattuortillion', 'quinvigintillion', 'sexvigintillion', 'septenvigintillion', 'octovigintillion', 'novemvigintillion', 'trigintillion', 'untrigintillion', 'duotrigintillion', 'trestrigintillion', 'quattuortrigintillion', 'quintrigintillion', 'sextrigintillion', 'septentrigintillion', 'octotrigintillion', 'novemtrigintillion', 'quadragintillion', 'unquadragintillion', 'duoquadragintillion', 'trequadragintillion', 'quattuorquadragintillion', 'quinquadragintillion', 'sesquadragintillion', 'septenquadragintillion', 'octoquadragintillion', 'novenquadragintillion', 'quinquagintillion']
module.exports = LOTS;

},{}],"../node_modules/bignumber.js/bignumber.js":[function(require,module,exports) {
var define;
/*! bignumber.js v2.4.0 https://github.com/MikeMcl/bignumber.js/LICENCE */

;(function (globalObj) {
    'use strict';

    /*
      bignumber.js v2.4.0
      A JavaScript library for arbitrary-precision arithmetic.
      https://github.com/MikeMcl/bignumber.js
      Copyright (c) 2016 Michael Mclaughlin <M8ch88l@gmail.com>
      MIT Expat Licence
    */


    var BigNumber, cryptoObj, parseNumeric,
        isNumeric = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
        mathceil = Math.ceil,
        mathfloor = Math.floor,
        notBool = ' not a boolean or binary digit',
        roundingMode = 'rounding mode',
        tooManyDigits = 'number type has more than 15 significant digits',
        ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_',
        BASE = 1e14,
        LOG_BASE = 14,
        MAX_SAFE_INTEGER = 0x1fffffffffffff,         // 2^53 - 1
        // MAX_INT32 = 0x7fffffff,                   // 2^31 - 1
        POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13],
        SQRT_BASE = 1e7,

        /*
         * The limit on the value of DECIMAL_PLACES, TO_EXP_NEG, TO_EXP_POS, MIN_EXP, MAX_EXP, and
         * the arguments to toExponential, toFixed, toFormat, and toPrecision, beyond which an
         * exception is thrown (if ERRORS is true).
         */
        MAX = 1E9;                                   // 0 to MAX_INT32

    if ( typeof crypto != 'undefined' ) cryptoObj = crypto;


    /*
     * Create and return a BigNumber constructor.
     */
    function constructorFactory(configObj) {
        var div,

            // id tracks the caller function, so its name can be included in error messages.
            id = 0,
            P = BigNumber.prototype,
            ONE = new BigNumber(1),


            /********************************* EDITABLE DEFAULTS **********************************/


            /*
             * The default values below must be integers within the inclusive ranges stated.
             * The values can also be changed at run-time using BigNumber.config.
             */

            // The maximum number of decimal places for operations involving division.
            DECIMAL_PLACES = 20,                     // 0 to MAX

            /*
             * The rounding mode used when rounding to the above decimal places, and when using
             * toExponential, toFixed, toFormat and toPrecision, and round (default value).
             * UP         0 Away from zero.
             * DOWN       1 Towards zero.
             * CEIL       2 Towards +Infinity.
             * FLOOR      3 Towards -Infinity.
             * HALF_UP    4 Towards nearest neighbour. If equidistant, up.
             * HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
             * HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
             * HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
             * HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
             */
            ROUNDING_MODE = 4,                       // 0 to 8

            // EXPONENTIAL_AT : [TO_EXP_NEG , TO_EXP_POS]

            // The exponent value at and beneath which toString returns exponential notation.
            // Number type: -7
            TO_EXP_NEG = -7,                         // 0 to -MAX

            // The exponent value at and above which toString returns exponential notation.
            // Number type: 21
            TO_EXP_POS = 21,                         // 0 to MAX

            // RANGE : [MIN_EXP, MAX_EXP]

            // The minimum exponent value, beneath which underflow to zero occurs.
            // Number type: -324  (5e-324)
            MIN_EXP = -1e7,                          // -1 to -MAX

            // The maximum exponent value, above which overflow to Infinity occurs.
            // Number type:  308  (1.7976931348623157e+308)
            // For MAX_EXP > 1e7, e.g. new BigNumber('1e100000000').plus(1) may be slow.
            MAX_EXP = 1e7,                           // 1 to MAX

            // Whether BigNumber Errors are ever thrown.
            ERRORS = true,                           // true or false

            // Change to intValidatorNoErrors if ERRORS is false.
            isValidInt = intValidatorWithErrors,     // intValidatorWithErrors/intValidatorNoErrors

            // Whether to use cryptographically-secure random number generation, if available.
            CRYPTO = false,                          // true or false

            /*
             * The modulo mode used when calculating the modulus: a mod n.
             * The quotient (q = a / n) is calculated according to the corresponding rounding mode.
             * The remainder (r) is calculated as: r = a - n * q.
             *
             * UP        0 The remainder is positive if the dividend is negative, else is negative.
             * DOWN      1 The remainder has the same sign as the dividend.
             *             This modulo mode is commonly known as 'truncated division' and is
             *             equivalent to (a % n) in JavaScript.
             * FLOOR     3 The remainder has the same sign as the divisor (Python %).
             * HALF_EVEN 6 This modulo mode implements the IEEE 754 remainder function.
             * EUCLID    9 Euclidian division. q = sign(n) * floor(a / abs(n)).
             *             The remainder is always positive.
             *
             * The truncated division, floored division, Euclidian division and IEEE 754 remainder
             * modes are commonly used for the modulus operation.
             * Although the other rounding modes can also be used, they may not give useful results.
             */
            MODULO_MODE = 1,                         // 0 to 9

            // The maximum number of significant digits of the result of the toPower operation.
            // If POW_PRECISION is 0, there will be unlimited significant digits.
            POW_PRECISION = 100,                     // 0 to MAX

            // The format specification used by the BigNumber.prototype.toFormat method.
            FORMAT = {
                decimalSeparator: '.',
                groupSeparator: ',',
                groupSize: 3,
                secondaryGroupSize: 0,
                fractionGroupSeparator: '\xA0',      // non-breaking space
                fractionGroupSize: 0
            };


        /******************************************************************************************/


        // CONSTRUCTOR


        /*
         * The BigNumber constructor and exported function.
         * Create and return a new instance of a BigNumber object.
         *
         * n {number|string|BigNumber} A numeric value.
         * [b] {number} The base of n. Integer, 2 to 64 inclusive.
         */
        function BigNumber( n, b ) {
            var c, e, i, num, len, str,
                x = this;

            // Enable constructor usage without new.
            if ( !( x instanceof BigNumber ) ) {

                // 'BigNumber() constructor call without new: {n}'
                if (ERRORS) raise( 26, 'constructor call without new', n );
                return new BigNumber( n, b );
            }

            // 'new BigNumber() base not an integer: {b}'
            // 'new BigNumber() base out of range: {b}'
            if ( b == null || !isValidInt( b, 2, 64, id, 'base' ) ) {

                // Duplicate.
                if ( n instanceof BigNumber ) {
                    x.s = n.s;
                    x.e = n.e;
                    x.c = ( n = n.c ) ? n.slice() : n;
                    id = 0;
                    return;
                }

                if ( ( num = typeof n == 'number' ) && n * 0 == 0 ) {
                    x.s = 1 / n < 0 ? ( n = -n, -1 ) : 1;

                    // Fast path for integers.
                    if ( n === ~~n ) {
                        for ( e = 0, i = n; i >= 10; i /= 10, e++ );
                        x.e = e;
                        x.c = [n];
                        id = 0;
                        return;
                    }

                    str = n + '';
                } else {
                    if ( !isNumeric.test( str = n + '' ) ) return parseNumeric( x, str, num );
                    x.s = str.charCodeAt(0) === 45 ? ( str = str.slice(1), -1 ) : 1;
                }
            } else {
                b = b | 0;
                str = n + '';

                // Ensure return value is rounded to DECIMAL_PLACES as with other bases.
                // Allow exponential notation to be used with base 10 argument.
                if ( b == 10 ) {
                    x = new BigNumber( n instanceof BigNumber ? n : str );
                    return round( x, DECIMAL_PLACES + x.e + 1, ROUNDING_MODE );
                }

                // Avoid potential interpretation of Infinity and NaN as base 44+ values.
                // Any number in exponential form will fail due to the [Ee][+-].
                if ( ( num = typeof n == 'number' ) && n * 0 != 0 ||
                  !( new RegExp( '^-?' + ( c = '[' + ALPHABET.slice( 0, b ) + ']+' ) +
                    '(?:\\.' + c + ')?$',b < 37 ? 'i' : '' ) ).test(str) ) {
                    return parseNumeric( x, str, num, b );
                }

                if (num) {
                    x.s = 1 / n < 0 ? ( str = str.slice(1), -1 ) : 1;

                    if ( ERRORS && str.replace( /^0\.0*|\./, '' ).length > 15 ) {

                        // 'new BigNumber() number type has more than 15 significant digits: {n}'
                        raise( id, tooManyDigits, n );
                    }

                    // Prevent later check for length on converted number.
                    num = false;
                } else {
                    x.s = str.charCodeAt(0) === 45 ? ( str = str.slice(1), -1 ) : 1;
                }

                str = convertBase( str, 10, b, x.s );
            }

            // Decimal point?
            if ( ( e = str.indexOf('.') ) > -1 ) str = str.replace( '.', '' );

            // Exponential form?
            if ( ( i = str.search( /e/i ) ) > 0 ) {

                // Determine exponent.
                if ( e < 0 ) e = i;
                e += +str.slice( i + 1 );
                str = str.substring( 0, i );
            } else if ( e < 0 ) {

                // Integer.
                e = str.length;
            }

            // Determine leading zeros.
            for ( i = 0; str.charCodeAt(i) === 48; i++ );

            // Determine trailing zeros.
            for ( len = str.length; str.charCodeAt(--len) === 48; );
            str = str.slice( i, len + 1 );

            if (str) {
                len = str.length;

                // Disallow numbers with over 15 significant digits if number type.
                // 'new BigNumber() number type has more than 15 significant digits: {n}'
                if ( num && ERRORS && len > 15 && ( n > MAX_SAFE_INTEGER || n !== mathfloor(n) ) ) {
                    raise( id, tooManyDigits, x.s * n );
                }

                e = e - i - 1;

                 // Overflow?
                if ( e > MAX_EXP ) {

                    // Infinity.
                    x.c = x.e = null;

                // Underflow?
                } else if ( e < MIN_EXP ) {

                    // Zero.
                    x.c = [ x.e = 0 ];
                } else {
                    x.e = e;
                    x.c = [];

                    // Transform base

                    // e is the base 10 exponent.
                    // i is where to slice str to get the first element of the coefficient array.
                    i = ( e + 1 ) % LOG_BASE;
                    if ( e < 0 ) i += LOG_BASE;

                    if ( i < len ) {
                        if (i) x.c.push( +str.slice( 0, i ) );

                        for ( len -= LOG_BASE; i < len; ) {
                            x.c.push( +str.slice( i, i += LOG_BASE ) );
                        }

                        str = str.slice(i);
                        i = LOG_BASE - str.length;
                    } else {
                        i -= len;
                    }

                    for ( ; i--; str += '0' );
                    x.c.push( +str );
                }
            } else {

                // Zero.
                x.c = [ x.e = 0 ];
            }

            id = 0;
        }


        // CONSTRUCTOR PROPERTIES


        BigNumber.another = constructorFactory;

        BigNumber.ROUND_UP = 0;
        BigNumber.ROUND_DOWN = 1;
        BigNumber.ROUND_CEIL = 2;
        BigNumber.ROUND_FLOOR = 3;
        BigNumber.ROUND_HALF_UP = 4;
        BigNumber.ROUND_HALF_DOWN = 5;
        BigNumber.ROUND_HALF_EVEN = 6;
        BigNumber.ROUND_HALF_CEIL = 7;
        BigNumber.ROUND_HALF_FLOOR = 8;
        BigNumber.EUCLID = 9;


        /*
         * Configure infrequently-changing library-wide settings.
         *
         * Accept an object or an argument list, with one or many of the following properties or
         * parameters respectively:
         *
         *   DECIMAL_PLACES  {number}  Integer, 0 to MAX inclusive
         *   ROUNDING_MODE   {number}  Integer, 0 to 8 inclusive
         *   EXPONENTIAL_AT  {number|number[]}  Integer, -MAX to MAX inclusive or
         *                                      [integer -MAX to 0 incl., 0 to MAX incl.]
         *   RANGE           {number|number[]}  Non-zero integer, -MAX to MAX inclusive or
         *                                      [integer -MAX to -1 incl., integer 1 to MAX incl.]
         *   ERRORS          {boolean|number}   true, false, 1 or 0
         *   CRYPTO          {boolean|number}   true, false, 1 or 0
         *   MODULO_MODE     {number}           0 to 9 inclusive
         *   POW_PRECISION   {number}           0 to MAX inclusive
         *   FORMAT          {object}           See BigNumber.prototype.toFormat
         *      decimalSeparator       {string}
         *      groupSeparator         {string}
         *      groupSize              {number}
         *      secondaryGroupSize     {number}
         *      fractionGroupSeparator {string}
         *      fractionGroupSize      {number}
         *
         * (The values assigned to the above FORMAT object properties are not checked for validity.)
         *
         * E.g.
         * BigNumber.config(20, 4) is equivalent to
         * BigNumber.config({ DECIMAL_PLACES : 20, ROUNDING_MODE : 4 })
         *
         * Ignore properties/parameters set to null or undefined.
         * Return an object with the properties current values.
         */
        BigNumber.config = function () {
            var v, p,
                i = 0,
                r = {},
                a = arguments,
                o = a[0],
                has = o && typeof o == 'object'
                  ? function () { if ( o.hasOwnProperty(p) ) return ( v = o[p] ) != null; }
                  : function () { if ( a.length > i ) return ( v = a[i++] ) != null; };

            // DECIMAL_PLACES {number} Integer, 0 to MAX inclusive.
            // 'config() DECIMAL_PLACES not an integer: {v}'
            // 'config() DECIMAL_PLACES out of range: {v}'
            if ( has( p = 'DECIMAL_PLACES' ) && isValidInt( v, 0, MAX, 2, p ) ) {
                DECIMAL_PLACES = v | 0;
            }
            r[p] = DECIMAL_PLACES;

            // ROUNDING_MODE {number} Integer, 0 to 8 inclusive.
            // 'config() ROUNDING_MODE not an integer: {v}'
            // 'config() ROUNDING_MODE out of range: {v}'
            if ( has( p = 'ROUNDING_MODE' ) && isValidInt( v, 0, 8, 2, p ) ) {
                ROUNDING_MODE = v | 0;
            }
            r[p] = ROUNDING_MODE;

            // EXPONENTIAL_AT {number|number[]}
            // Integer, -MAX to MAX inclusive or [integer -MAX to 0 inclusive, 0 to MAX inclusive].
            // 'config() EXPONENTIAL_AT not an integer: {v}'
            // 'config() EXPONENTIAL_AT out of range: {v}'
            if ( has( p = 'EXPONENTIAL_AT' ) ) {

                if ( isArray(v) ) {
                    if ( isValidInt( v[0], -MAX, 0, 2, p ) && isValidInt( v[1], 0, MAX, 2, p ) ) {
                        TO_EXP_NEG = v[0] | 0;
                        TO_EXP_POS = v[1] | 0;
                    }
                } else if ( isValidInt( v, -MAX, MAX, 2, p ) ) {
                    TO_EXP_NEG = -( TO_EXP_POS = ( v < 0 ? -v : v ) | 0 );
                }
            }
            r[p] = [ TO_EXP_NEG, TO_EXP_POS ];

            // RANGE {number|number[]} Non-zero integer, -MAX to MAX inclusive or
            // [integer -MAX to -1 inclusive, integer 1 to MAX inclusive].
            // 'config() RANGE not an integer: {v}'
            // 'config() RANGE cannot be zero: {v}'
            // 'config() RANGE out of range: {v}'
            if ( has( p = 'RANGE' ) ) {

                if ( isArray(v) ) {
                    if ( isValidInt( v[0], -MAX, -1, 2, p ) && isValidInt( v[1], 1, MAX, 2, p ) ) {
                        MIN_EXP = v[0] | 0;
                        MAX_EXP = v[1] | 0;
                    }
                } else if ( isValidInt( v, -MAX, MAX, 2, p ) ) {
                    if ( v | 0 ) MIN_EXP = -( MAX_EXP = ( v < 0 ? -v : v ) | 0 );
                    else if (ERRORS) raise( 2, p + ' cannot be zero', v );
                }
            }
            r[p] = [ MIN_EXP, MAX_EXP ];

            // ERRORS {boolean|number} true, false, 1 or 0.
            // 'config() ERRORS not a boolean or binary digit: {v}'
            if ( has( p = 'ERRORS' ) ) {

                if ( v === !!v || v === 1 || v === 0 ) {
                    id = 0;
                    isValidInt = ( ERRORS = !!v ) ? intValidatorWithErrors : intValidatorNoErrors;
                } else if (ERRORS) {
                    raise( 2, p + notBool, v );
                }
            }
            r[p] = ERRORS;

            // CRYPTO {boolean|number} true, false, 1 or 0.
            // 'config() CRYPTO not a boolean or binary digit: {v}'
            // 'config() crypto unavailable: {crypto}'
            if ( has( p = 'CRYPTO' ) ) {

                if ( v === !!v || v === 1 || v === 0 ) {
                    CRYPTO = !!( v && cryptoObj );
                    if ( v && !CRYPTO && ERRORS ) raise( 2, 'crypto unavailable', cryptoObj );
                } else if (ERRORS) {
                    raise( 2, p + notBool, v );
                }
            }
            r[p] = CRYPTO;

            // MODULO_MODE {number} Integer, 0 to 9 inclusive.
            // 'config() MODULO_MODE not an integer: {v}'
            // 'config() MODULO_MODE out of range: {v}'
            if ( has( p = 'MODULO_MODE' ) && isValidInt( v, 0, 9, 2, p ) ) {
                MODULO_MODE = v | 0;
            }
            r[p] = MODULO_MODE;

            // POW_PRECISION {number} Integer, 0 to MAX inclusive.
            // 'config() POW_PRECISION not an integer: {v}'
            // 'config() POW_PRECISION out of range: {v}'
            if ( has( p = 'POW_PRECISION' ) && isValidInt( v, 0, MAX, 2, p ) ) {
                POW_PRECISION = v | 0;
            }
            r[p] = POW_PRECISION;

            // FORMAT {object}
            // 'config() FORMAT not an object: {v}'
            if ( has( p = 'FORMAT' ) ) {

                if ( typeof v == 'object' ) {
                    FORMAT = v;
                } else if (ERRORS) {
                    raise( 2, p + ' not an object', v );
                }
            }
            r[p] = FORMAT;

            return r;
        };


        /*
         * Return a new BigNumber whose value is the maximum of the arguments.
         *
         * arguments {number|string|BigNumber}
         */
        BigNumber.max = function () { return maxOrMin( arguments, P.lt ); };


        /*
         * Return a new BigNumber whose value is the minimum of the arguments.
         *
         * arguments {number|string|BigNumber}
         */
        BigNumber.min = function () { return maxOrMin( arguments, P.gt ); };


        /*
         * Return a new BigNumber with a random value equal to or greater than 0 and less than 1,
         * and with dp, or DECIMAL_PLACES if dp is omitted, decimal places (or less if trailing
         * zeros are produced).
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         *
         * 'random() decimal places not an integer: {dp}'
         * 'random() decimal places out of range: {dp}'
         * 'random() crypto unavailable: {crypto}'
         */
        BigNumber.random = (function () {
            var pow2_53 = 0x20000000000000;

            // Return a 53 bit integer n, where 0 <= n < 9007199254740992.
            // Check if Math.random() produces more than 32 bits of randomness.
            // If it does, assume at least 53 bits are produced, otherwise assume at least 30 bits.
            // 0x40000000 is 2^30, 0x800000 is 2^23, 0x1fffff is 2^21 - 1.
            var random53bitInt = (Math.random() * pow2_53) & 0x1fffff
              ? function () { return mathfloor( Math.random() * pow2_53 ); }
              : function () { return ((Math.random() * 0x40000000 | 0) * 0x800000) +
                  (Math.random() * 0x800000 | 0); };

            return function (dp) {
                var a, b, e, k, v,
                    i = 0,
                    c = [],
                    rand = new BigNumber(ONE);

                dp = dp == null || !isValidInt( dp, 0, MAX, 14 ) ? DECIMAL_PLACES : dp | 0;
                k = mathceil( dp / LOG_BASE );

                if (CRYPTO) {

                    // Browsers supporting crypto.getRandomValues.
                    if ( cryptoObj && cryptoObj.getRandomValues ) {

                        a = cryptoObj.getRandomValues( new Uint32Array( k *= 2 ) );

                        for ( ; i < k; ) {

                            // 53 bits:
                            // ((Math.pow(2, 32) - 1) * Math.pow(2, 21)).toString(2)
                            // 11111 11111111 11111111 11111111 11100000 00000000 00000000
                            // ((Math.pow(2, 32) - 1) >>> 11).toString(2)
                            //                                     11111 11111111 11111111
                            // 0x20000 is 2^21.
                            v = a[i] * 0x20000 + (a[i + 1] >>> 11);

                            // Rejection sampling:
                            // 0 <= v < 9007199254740992
                            // Probability that v >= 9e15, is
                            // 7199254740992 / 9007199254740992 ~= 0.0008, i.e. 1 in 1251
                            if ( v >= 9e15 ) {
                                b = cryptoObj.getRandomValues( new Uint32Array(2) );
                                a[i] = b[0];
                                a[i + 1] = b[1];
                            } else {

                                // 0 <= v <= 8999999999999999
                                // 0 <= (v % 1e14) <= 99999999999999
                                c.push( v % 1e14 );
                                i += 2;
                            }
                        }
                        i = k / 2;

                    // Node.js supporting crypto.randomBytes.
                    } else if ( cryptoObj && cryptoObj.randomBytes ) {

                        // buffer
                        a = cryptoObj.randomBytes( k *= 7 );

                        for ( ; i < k; ) {

                            // 0x1000000000000 is 2^48, 0x10000000000 is 2^40
                            // 0x100000000 is 2^32, 0x1000000 is 2^24
                            // 11111 11111111 11111111 11111111 11111111 11111111 11111111
                            // 0 <= v < 9007199254740992
                            v = ( ( a[i] & 31 ) * 0x1000000000000 ) + ( a[i + 1] * 0x10000000000 ) +
                                  ( a[i + 2] * 0x100000000 ) + ( a[i + 3] * 0x1000000 ) +
                                  ( a[i + 4] << 16 ) + ( a[i + 5] << 8 ) + a[i + 6];

                            if ( v >= 9e15 ) {
                                cryptoObj.randomBytes(7).copy( a, i );
                            } else {

                                // 0 <= (v % 1e14) <= 99999999999999
                                c.push( v % 1e14 );
                                i += 7;
                            }
                        }
                        i = k / 7;
                    } else if (ERRORS) {
                        raise( 14, 'crypto unavailable', cryptoObj );
                    }
                }

                // Use Math.random: CRYPTO is false or crypto is unavailable and ERRORS is false.
                if (!i) {

                    for ( ; i < k; ) {
                        v = random53bitInt();
                        if ( v < 9e15 ) c[i++] = v % 1e14;
                    }
                }

                k = c[--i];
                dp %= LOG_BASE;

                // Convert trailing digits to zeros according to dp.
                if ( k && dp ) {
                    v = POWS_TEN[LOG_BASE - dp];
                    c[i] = mathfloor( k / v ) * v;
                }

                // Remove trailing elements which are zero.
                for ( ; c[i] === 0; c.pop(), i-- );

                // Zero?
                if ( i < 0 ) {
                    c = [ e = 0 ];
                } else {

                    // Remove leading elements which are zero and adjust exponent accordingly.
                    for ( e = -1 ; c[0] === 0; c.shift(), e -= LOG_BASE);

                    // Count the digits of the first element of c to determine leading zeros, and...
                    for ( i = 1, v = c[0]; v >= 10; v /= 10, i++);

                    // adjust the exponent accordingly.
                    if ( i < LOG_BASE ) e -= LOG_BASE - i;
                }

                rand.e = e;
                rand.c = c;
                return rand;
            };
        })();


        // PRIVATE FUNCTIONS


        // Convert a numeric string of baseIn to a numeric string of baseOut.
        function convertBase( str, baseOut, baseIn, sign ) {
            var d, e, k, r, x, xc, y,
                i = str.indexOf( '.' ),
                dp = DECIMAL_PLACES,
                rm = ROUNDING_MODE;

            if ( baseIn < 37 ) str = str.toLowerCase();

            // Non-integer.
            if ( i >= 0 ) {
                k = POW_PRECISION;

                // Unlimited precision.
                POW_PRECISION = 0;
                str = str.replace( '.', '' );
                y = new BigNumber(baseIn);
                x = y.pow( str.length - i );
                POW_PRECISION = k;

                // Convert str as if an integer, then restore the fraction part by dividing the
                // result by its base raised to a power.
                y.c = toBaseOut( toFixedPoint( coeffToString( x.c ), x.e ), 10, baseOut );
                y.e = y.c.length;
            }

            // Convert the number as integer.
            xc = toBaseOut( str, baseIn, baseOut );
            e = k = xc.length;

            // Remove trailing zeros.
            for ( ; xc[--k] == 0; xc.pop() );
            if ( !xc[0] ) return '0';

            if ( i < 0 ) {
                --e;
            } else {
                x.c = xc;
                x.e = e;

                // sign is needed for correct rounding.
                x.s = sign;
                x = div( x, y, dp, rm, baseOut );
                xc = x.c;
                r = x.r;
                e = x.e;
            }

            d = e + dp + 1;

            // The rounding digit, i.e. the digit to the right of the digit that may be rounded up.
            i = xc[d];
            k = baseOut / 2;
            r = r || d < 0 || xc[d + 1] != null;

            r = rm < 4 ? ( i != null || r ) && ( rm == 0 || rm == ( x.s < 0 ? 3 : 2 ) )
                       : i > k || i == k &&( rm == 4 || r || rm == 6 && xc[d - 1] & 1 ||
                         rm == ( x.s < 0 ? 8 : 7 ) );

            if ( d < 1 || !xc[0] ) {

                // 1^-dp or 0.
                str = r ? toFixedPoint( '1', -dp ) : '0';
            } else {
                xc.length = d;

                if (r) {

                    // Rounding up may mean the previous digit has to be rounded up and so on.
                    for ( --baseOut; ++xc[--d] > baseOut; ) {
                        xc[d] = 0;

                        if ( !d ) {
                            ++e;
                            xc.unshift(1);
                        }
                    }
                }

                // Determine trailing zeros.
                for ( k = xc.length; !xc[--k]; );

                // E.g. [4, 11, 15] becomes 4bf.
                for ( i = 0, str = ''; i <= k; str += ALPHABET.charAt( xc[i++] ) );
                str = toFixedPoint( str, e );
            }

            // The caller will add the sign.
            return str;
        }


        // Perform division in the specified base. Called by div and convertBase.
        div = (function () {

            // Assume non-zero x and k.
            function multiply( x, k, base ) {
                var m, temp, xlo, xhi,
                    carry = 0,
                    i = x.length,
                    klo = k % SQRT_BASE,
                    khi = k / SQRT_BASE | 0;

                for ( x = x.slice(); i--; ) {
                    xlo = x[i] % SQRT_BASE;
                    xhi = x[i] / SQRT_BASE | 0;
                    m = khi * xlo + xhi * klo;
                    temp = klo * xlo + ( ( m % SQRT_BASE ) * SQRT_BASE ) + carry;
                    carry = ( temp / base | 0 ) + ( m / SQRT_BASE | 0 ) + khi * xhi;
                    x[i] = temp % base;
                }

                if (carry) x.unshift(carry);

                return x;
            }

            function compare( a, b, aL, bL ) {
                var i, cmp;

                if ( aL != bL ) {
                    cmp = aL > bL ? 1 : -1;
                } else {

                    for ( i = cmp = 0; i < aL; i++ ) {

                        if ( a[i] != b[i] ) {
                            cmp = a[i] > b[i] ? 1 : -1;
                            break;
                        }
                    }
                }
                return cmp;
            }

            function subtract( a, b, aL, base ) {
                var i = 0;

                // Subtract b from a.
                for ( ; aL--; ) {
                    a[aL] -= i;
                    i = a[aL] < b[aL] ? 1 : 0;
                    a[aL] = i * base + a[aL] - b[aL];
                }

                // Remove leading zeros.
                for ( ; !a[0] && a.length > 1; a.shift() );
            }

            // x: dividend, y: divisor.
            return function ( x, y, dp, rm, base ) {
                var cmp, e, i, more, n, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0,
                    yL, yz,
                    s = x.s == y.s ? 1 : -1,
                    xc = x.c,
                    yc = y.c;

                // Either NaN, Infinity or 0?
                if ( !xc || !xc[0] || !yc || !yc[0] ) {

                    return new BigNumber(

                      // Return NaN if either NaN, or both Infinity or 0.
                      !x.s || !y.s || ( xc ? yc && xc[0] == yc[0] : !yc ) ? NaN :

                        // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
                        xc && xc[0] == 0 || !yc ? s * 0 : s / 0
                    );
                }

                q = new BigNumber(s);
                qc = q.c = [];
                e = x.e - y.e;
                s = dp + e + 1;

                if ( !base ) {
                    base = BASE;
                    e = bitFloor( x.e / LOG_BASE ) - bitFloor( y.e / LOG_BASE );
                    s = s / LOG_BASE | 0;
                }

                // Result exponent may be one less then the current value of e.
                // The coefficients of the BigNumbers from convertBase may have trailing zeros.
                for ( i = 0; yc[i] == ( xc[i] || 0 ); i++ );
                if ( yc[i] > ( xc[i] || 0 ) ) e--;

                if ( s < 0 ) {
                    qc.push(1);
                    more = true;
                } else {
                    xL = xc.length;
                    yL = yc.length;
                    i = 0;
                    s += 2;

                    // Normalise xc and yc so highest order digit of yc is >= base / 2.

                    n = mathfloor( base / ( yc[0] + 1 ) );

                    // Not necessary, but to handle odd bases where yc[0] == ( base / 2 ) - 1.
                    // if ( n > 1 || n++ == 1 && yc[0] < base / 2 ) {
                    if ( n > 1 ) {
                        yc = multiply( yc, n, base );
                        xc = multiply( xc, n, base );
                        yL = yc.length;
                        xL = xc.length;
                    }

                    xi = yL;
                    rem = xc.slice( 0, yL );
                    remL = rem.length;

                    // Add zeros to make remainder as long as divisor.
                    for ( ; remL < yL; rem[remL++] = 0 );
                    yz = yc.slice();
                    yz.unshift(0);
                    yc0 = yc[0];
                    if ( yc[1] >= base / 2 ) yc0++;
                    // Not necessary, but to prevent trial digit n > base, when using base 3.
                    // else if ( base == 3 && yc0 == 1 ) yc0 = 1 + 1e-15;

                    do {
                        n = 0;

                        // Compare divisor and remainder.
                        cmp = compare( yc, rem, yL, remL );

                        // If divisor < remainder.
                        if ( cmp < 0 ) {

                            // Calculate trial digit, n.

                            rem0 = rem[0];
                            if ( yL != remL ) rem0 = rem0 * base + ( rem[1] || 0 );

                            // n is how many times the divisor goes into the current remainder.
                            n = mathfloor( rem0 / yc0 );

                            //  Algorithm:
                            //  1. product = divisor * trial digit (n)
                            //  2. if product > remainder: product -= divisor, n--
                            //  3. remainder -= product
                            //  4. if product was < remainder at 2:
                            //    5. compare new remainder and divisor
                            //    6. If remainder > divisor: remainder -= divisor, n++

                            if ( n > 1 ) {

                                // n may be > base only when base is 3.
                                if (n >= base) n = base - 1;

                                // product = divisor * trial digit.
                                prod = multiply( yc, n, base );
                                prodL = prod.length;
                                remL = rem.length;

                                // Compare product and remainder.
                                // If product > remainder.
                                // Trial digit n too high.
                                // n is 1 too high about 5% of the time, and is not known to have
                                // ever been more than 1 too high.
                                while ( compare( prod, rem, prodL, remL ) == 1 ) {
                                    n--;

                                    // Subtract divisor from product.
                                    subtract( prod, yL < prodL ? yz : yc, prodL, base );
                                    prodL = prod.length;
                                    cmp = 1;
                                }
                            } else {

                                // n is 0 or 1, cmp is -1.
                                // If n is 0, there is no need to compare yc and rem again below,
                                // so change cmp to 1 to avoid it.
                                // If n is 1, leave cmp as -1, so yc and rem are compared again.
                                if ( n == 0 ) {

                                    // divisor < remainder, so n must be at least 1.
                                    cmp = n = 1;
                                }

                                // product = divisor
                                prod = yc.slice();
                                prodL = prod.length;
                            }

                            if ( prodL < remL ) prod.unshift(0);

                            // Subtract product from remainder.
                            subtract( rem, prod, remL, base );
                            remL = rem.length;

                             // If product was < remainder.
                            if ( cmp == -1 ) {

                                // Compare divisor and new remainder.
                                // If divisor < new remainder, subtract divisor from remainder.
                                // Trial digit n too low.
                                // n is 1 too low about 5% of the time, and very rarely 2 too low.
                                while ( compare( yc, rem, yL, remL ) < 1 ) {
                                    n++;

                                    // Subtract divisor from remainder.
                                    subtract( rem, yL < remL ? yz : yc, remL, base );
                                    remL = rem.length;
                                }
                            }
                        } else if ( cmp === 0 ) {
                            n++;
                            rem = [0];
                        } // else cmp === 1 and n will be 0

                        // Add the next digit, n, to the result array.
                        qc[i++] = n;

                        // Update the remainder.
                        if ( rem[0] ) {
                            rem[remL++] = xc[xi] || 0;
                        } else {
                            rem = [ xc[xi] ];
                            remL = 1;
                        }
                    } while ( ( xi++ < xL || rem[0] != null ) && s-- );

                    more = rem[0] != null;

                    // Leading zero?
                    if ( !qc[0] ) qc.shift();
                }

                if ( base == BASE ) {

                    // To calculate q.e, first get the number of digits of qc[0].
                    for ( i = 1, s = qc[0]; s >= 10; s /= 10, i++ );
                    round( q, dp + ( q.e = i + e * LOG_BASE - 1 ) + 1, rm, more );

                // Caller is convertBase.
                } else {
                    q.e = e;
                    q.r = +more;
                }

                return q;
            };
        })();


        /*
         * Return a string representing the value of BigNumber n in fixed-point or exponential
         * notation rounded to the specified decimal places or significant digits.
         *
         * n is a BigNumber.
         * i is the index of the last digit required (i.e. the digit that may be rounded up).
         * rm is the rounding mode.
         * caller is caller id: toExponential 19, toFixed 20, toFormat 21, toPrecision 24.
         */
        function format( n, i, rm, caller ) {
            var c0, e, ne, len, str;

            rm = rm != null && isValidInt( rm, 0, 8, caller, roundingMode )
              ? rm | 0 : ROUNDING_MODE;

            if ( !n.c ) return n.toString();
            c0 = n.c[0];
            ne = n.e;

            if ( i == null ) {
                str = coeffToString( n.c );
                str = caller == 19 || caller == 24 && ne <= TO_EXP_NEG
                  ? toExponential( str, ne )
                  : toFixedPoint( str, ne );
            } else {
                n = round( new BigNumber(n), i, rm );

                // n.e may have changed if the value was rounded up.
                e = n.e;

                str = coeffToString( n.c );
                len = str.length;

                // toPrecision returns exponential notation if the number of significant digits
                // specified is less than the number of digits necessary to represent the integer
                // part of the value in fixed-point notation.

                // Exponential notation.
                if ( caller == 19 || caller == 24 && ( i <= e || e <= TO_EXP_NEG ) ) {

                    // Append zeros?
                    for ( ; len < i; str += '0', len++ );
                    str = toExponential( str, e );

                // Fixed-point notation.
                } else {
                    i -= ne;
                    str = toFixedPoint( str, e );

                    // Append zeros?
                    if ( e + 1 > len ) {
                        if ( --i > 0 ) for ( str += '.'; i--; str += '0' );
                    } else {
                        i += e - len;
                        if ( i > 0 ) {
                            if ( e + 1 == len ) str += '.';
                            for ( ; i--; str += '0' );
                        }
                    }
                }
            }

            return n.s < 0 && c0 ? '-' + str : str;
        }


        // Handle BigNumber.max and BigNumber.min.
        function maxOrMin( args, method ) {
            var m, n,
                i = 0;

            if ( isArray( args[0] ) ) args = args[0];
            m = new BigNumber( args[0] );

            for ( ; ++i < args.length; ) {
                n = new BigNumber( args[i] );

                // If any number is NaN, return NaN.
                if ( !n.s ) {
                    m = n;
                    break;
                } else if ( method.call( m, n ) ) {
                    m = n;
                }
            }

            return m;
        }


        /*
         * Return true if n is an integer in range, otherwise throw.
         * Use for argument validation when ERRORS is true.
         */
        function intValidatorWithErrors( n, min, max, caller, name ) {
            if ( n < min || n > max || n != truncate(n) ) {
                raise( caller, ( name || 'decimal places' ) +
                  ( n < min || n > max ? ' out of range' : ' not an integer' ), n );
            }

            return true;
        }


        /*
         * Strip trailing zeros, calculate base 10 exponent and check against MIN_EXP and MAX_EXP.
         * Called by minus, plus and times.
         */
        function normalise( n, c, e ) {
            var i = 1,
                j = c.length;

             // Remove trailing zeros.
            for ( ; !c[--j]; c.pop() );

            // Calculate the base 10 exponent. First get the number of digits of c[0].
            for ( j = c[0]; j >= 10; j /= 10, i++ );

            // Overflow?
            if ( ( e = i + e * LOG_BASE - 1 ) > MAX_EXP ) {

                // Infinity.
                n.c = n.e = null;

            // Underflow?
            } else if ( e < MIN_EXP ) {

                // Zero.
                n.c = [ n.e = 0 ];
            } else {
                n.e = e;
                n.c = c;
            }

            return n;
        }


        // Handle values that fail the validity test in BigNumber.
        parseNumeric = (function () {
            var basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i,
                dotAfter = /^([^.]+)\.$/,
                dotBefore = /^\.([^.]+)$/,
                isInfinityOrNaN = /^-?(Infinity|NaN)$/,
                whitespaceOrPlus = /^\s*\+(?=[\w.])|^\s+|\s+$/g;

            return function ( x, str, num, b ) {
                var base,
                    s = num ? str : str.replace( whitespaceOrPlus, '' );

                // No exception on ±Infinity or NaN.
                if ( isInfinityOrNaN.test(s) ) {
                    x.s = isNaN(s) ? null : s < 0 ? -1 : 1;
                } else {
                    if ( !num ) {

                        // basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i
                        s = s.replace( basePrefix, function ( m, p1, p2 ) {
                            base = ( p2 = p2.toLowerCase() ) == 'x' ? 16 : p2 == 'b' ? 2 : 8;
                            return !b || b == base ? p1 : m;
                        });

                        if (b) {
                            base = b;

                            // E.g. '1.' to '1', '.1' to '0.1'
                            s = s.replace( dotAfter, '$1' ).replace( dotBefore, '0.$1' );
                        }

                        if ( str != s ) return new BigNumber( s, base );
                    }

                    // 'new BigNumber() not a number: {n}'
                    // 'new BigNumber() not a base {b} number: {n}'
                    if (ERRORS) raise( id, 'not a' + ( b ? ' base ' + b : '' ) + ' number', str );
                    x.s = null;
                }

                x.c = x.e = null;
                id = 0;
            }
        })();


        // Throw a BigNumber Error.
        function raise( caller, msg, val ) {
            var error = new Error( [
                'new BigNumber',     // 0
                'cmp',               // 1
                'config',            // 2
                'div',               // 3
                'divToInt',          // 4
                'eq',                // 5
                'gt',                // 6
                'gte',               // 7
                'lt',                // 8
                'lte',               // 9
                'minus',             // 10
                'mod',               // 11
                'plus',              // 12
                'precision',         // 13
                'random',            // 14
                'round',             // 15
                'shift',             // 16
                'times',             // 17
                'toDigits',          // 18
                'toExponential',     // 19
                'toFixed',           // 20
                'toFormat',          // 21
                'toFraction',        // 22
                'pow',               // 23
                'toPrecision',       // 24
                'toString',          // 25
                'BigNumber'          // 26
            ][caller] + '() ' + msg + ': ' + val );

            error.name = 'BigNumber Error';
            id = 0;
            throw error;
        }


        /*
         * Round x to sd significant digits using rounding mode rm. Check for over/under-flow.
         * If r is truthy, it is known that there are more digits after the rounding digit.
         */
        function round( x, sd, rm, r ) {
            var d, i, j, k, n, ni, rd,
                xc = x.c,
                pows10 = POWS_TEN;

            // if x is not Infinity or NaN...
            if (xc) {

                // rd is the rounding digit, i.e. the digit after the digit that may be rounded up.
                // n is a base 1e14 number, the value of the element of array x.c containing rd.
                // ni is the index of n within x.c.
                // d is the number of digits of n.
                // i is the index of rd within n including leading zeros.
                // j is the actual index of rd within n (if < 0, rd is a leading zero).
                out: {

                    // Get the number of digits of the first element of xc.
                    for ( d = 1, k = xc[0]; k >= 10; k /= 10, d++ );
                    i = sd - d;

                    // If the rounding digit is in the first element of xc...
                    if ( i < 0 ) {
                        i += LOG_BASE;
                        j = sd;
                        n = xc[ ni = 0 ];

                        // Get the rounding digit at index j of n.
                        rd = n / pows10[ d - j - 1 ] % 10 | 0;
                    } else {
                        ni = mathceil( ( i + 1 ) / LOG_BASE );

                        if ( ni >= xc.length ) {

                            if (r) {

                                // Needed by sqrt.
                                for ( ; xc.length <= ni; xc.push(0) );
                                n = rd = 0;
                                d = 1;
                                i %= LOG_BASE;
                                j = i - LOG_BASE + 1;
                            } else {
                                break out;
                            }
                        } else {
                            n = k = xc[ni];

                            // Get the number of digits of n.
                            for ( d = 1; k >= 10; k /= 10, d++ );

                            // Get the index of rd within n.
                            i %= LOG_BASE;

                            // Get the index of rd within n, adjusted for leading zeros.
                            // The number of leading zeros of n is given by LOG_BASE - d.
                            j = i - LOG_BASE + d;

                            // Get the rounding digit at index j of n.
                            rd = j < 0 ? 0 : n / pows10[ d - j - 1 ] % 10 | 0;
                        }
                    }

                    r = r || sd < 0 ||

                    // Are there any non-zero digits after the rounding digit?
                    // The expression  n % pows10[ d - j - 1 ]  returns all digits of n to the right
                    // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
                      xc[ni + 1] != null || ( j < 0 ? n : n % pows10[ d - j - 1 ] );

                    r = rm < 4
                      ? ( rd || r ) && ( rm == 0 || rm == ( x.s < 0 ? 3 : 2 ) )
                      : rd > 5 || rd == 5 && ( rm == 4 || r || rm == 6 &&

                        // Check whether the digit to the left of the rounding digit is odd.
                        ( ( i > 0 ? j > 0 ? n / pows10[ d - j ] : 0 : xc[ni - 1] ) % 10 ) & 1 ||
                          rm == ( x.s < 0 ? 8 : 7 ) );

                    if ( sd < 1 || !xc[0] ) {
                        xc.length = 0;

                        if (r) {

                            // Convert sd to decimal places.
                            sd -= x.e + 1;

                            // 1, 0.1, 0.01, 0.001, 0.0001 etc.
                            xc[0] = pows10[ ( LOG_BASE - sd % LOG_BASE ) % LOG_BASE ];
                            x.e = -sd || 0;
                        } else {

                            // Zero.
                            xc[0] = x.e = 0;
                        }

                        return x;
                    }

                    // Remove excess digits.
                    if ( i == 0 ) {
                        xc.length = ni;
                        k = 1;
                        ni--;
                    } else {
                        xc.length = ni + 1;
                        k = pows10[ LOG_BASE - i ];

                        // E.g. 56700 becomes 56000 if 7 is the rounding digit.
                        // j > 0 means i > number of leading zeros of n.
                        xc[ni] = j > 0 ? mathfloor( n / pows10[ d - j ] % pows10[j] ) * k : 0;
                    }

                    // Round up?
                    if (r) {

                        for ( ; ; ) {

                            // If the digit to be rounded up is in the first element of xc...
                            if ( ni == 0 ) {

                                // i will be the length of xc[0] before k is added.
                                for ( i = 1, j = xc[0]; j >= 10; j /= 10, i++ );
                                j = xc[0] += k;
                                for ( k = 1; j >= 10; j /= 10, k++ );

                                // if i != k the length has increased.
                                if ( i != k ) {
                                    x.e++;
                                    if ( xc[0] == BASE ) xc[0] = 1;
                                }

                                break;
                            } else {
                                xc[ni] += k;
                                if ( xc[ni] != BASE ) break;
                                xc[ni--] = 0;
                                k = 1;
                            }
                        }
                    }

                    // Remove trailing zeros.
                    for ( i = xc.length; xc[--i] === 0; xc.pop() );
                }

                // Overflow? Infinity.
                if ( x.e > MAX_EXP ) {
                    x.c = x.e = null;

                // Underflow? Zero.
                } else if ( x.e < MIN_EXP ) {
                    x.c = [ x.e = 0 ];
                }
            }

            return x;
        }


        // PROTOTYPE/INSTANCE METHODS


        /*
         * Return a new BigNumber whose value is the absolute value of this BigNumber.
         */
        P.absoluteValue = P.abs = function () {
            var x = new BigNumber(this);
            if ( x.s < 0 ) x.s = 1;
            return x;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a whole
         * number in the direction of Infinity.
         */
        P.ceil = function () {
            return round( new BigNumber(this), this.e + 1, 2 );
        };


        /*
         * Return
         * 1 if the value of this BigNumber is greater than the value of BigNumber(y, b),
         * -1 if the value of this BigNumber is less than the value of BigNumber(y, b),
         * 0 if they have the same value,
         * or null if the value of either is NaN.
         */
        P.comparedTo = P.cmp = function ( y, b ) {
            id = 1;
            return compare( this, new BigNumber( y, b ) );
        };


        /*
         * Return the number of decimal places of the value of this BigNumber, or null if the value
         * of this BigNumber is ±Infinity or NaN.
         */
        P.decimalPlaces = P.dp = function () {
            var n, v,
                c = this.c;

            if ( !c ) return null;
            n = ( ( v = c.length - 1 ) - bitFloor( this.e / LOG_BASE ) ) * LOG_BASE;

            // Subtract the number of trailing zeros of the last number.
            if ( v = c[v] ) for ( ; v % 10 == 0; v /= 10, n-- );
            if ( n < 0 ) n = 0;

            return n;
        };


        /*
         *  n / 0 = I
         *  n / N = N
         *  n / I = 0
         *  0 / n = 0
         *  0 / 0 = N
         *  0 / N = N
         *  0 / I = 0
         *  N / n = N
         *  N / 0 = N
         *  N / N = N
         *  N / I = N
         *  I / n = I
         *  I / 0 = I
         *  I / N = N
         *  I / I = N
         *
         * Return a new BigNumber whose value is the value of this BigNumber divided by the value of
         * BigNumber(y, b), rounded according to DECIMAL_PLACES and ROUNDING_MODE.
         */
        P.dividedBy = P.div = function ( y, b ) {
            id = 3;
            return div( this, new BigNumber( y, b ), DECIMAL_PLACES, ROUNDING_MODE );
        };


        /*
         * Return a new BigNumber whose value is the integer part of dividing the value of this
         * BigNumber by the value of BigNumber(y, b).
         */
        P.dividedToIntegerBy = P.divToInt = function ( y, b ) {
            id = 4;
            return div( this, new BigNumber( y, b ), 0, 1 );
        };


        /*
         * Return true if the value of this BigNumber is equal to the value of BigNumber(y, b),
         * otherwise returns false.
         */
        P.equals = P.eq = function ( y, b ) {
            id = 5;
            return compare( this, new BigNumber( y, b ) ) === 0;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a whole
         * number in the direction of -Infinity.
         */
        P.floor = function () {
            return round( new BigNumber(this), this.e + 1, 3 );
        };


        /*
         * Return true if the value of this BigNumber is greater than the value of BigNumber(y, b),
         * otherwise returns false.
         */
        P.greaterThan = P.gt = function ( y, b ) {
            id = 6;
            return compare( this, new BigNumber( y, b ) ) > 0;
        };


        /*
         * Return true if the value of this BigNumber is greater than or equal to the value of
         * BigNumber(y, b), otherwise returns false.
         */
        P.greaterThanOrEqualTo = P.gte = function ( y, b ) {
            id = 7;
            return ( b = compare( this, new BigNumber( y, b ) ) ) === 1 || b === 0;

        };


        /*
         * Return true if the value of this BigNumber is a finite number, otherwise returns false.
         */
        P.isFinite = function () {
            return !!this.c;
        };


        /*
         * Return true if the value of this BigNumber is an integer, otherwise return false.
         */
        P.isInteger = P.isInt = function () {
            return !!this.c && bitFloor( this.e / LOG_BASE ) > this.c.length - 2;
        };


        /*
         * Return true if the value of this BigNumber is NaN, otherwise returns false.
         */
        P.isNaN = function () {
            return !this.s;
        };


        /*
         * Return true if the value of this BigNumber is negative, otherwise returns false.
         */
        P.isNegative = P.isNeg = function () {
            return this.s < 0;
        };


        /*
         * Return true if the value of this BigNumber is 0 or -0, otherwise returns false.
         */
        P.isZero = function () {
            return !!this.c && this.c[0] == 0;
        };


        /*
         * Return true if the value of this BigNumber is less than the value of BigNumber(y, b),
         * otherwise returns false.
         */
        P.lessThan = P.lt = function ( y, b ) {
            id = 8;
            return compare( this, new BigNumber( y, b ) ) < 0;
        };


        /*
         * Return true if the value of this BigNumber is less than or equal to the value of
         * BigNumber(y, b), otherwise returns false.
         */
        P.lessThanOrEqualTo = P.lte = function ( y, b ) {
            id = 9;
            return ( b = compare( this, new BigNumber( y, b ) ) ) === -1 || b === 0;
        };


        /*
         *  n - 0 = n
         *  n - N = N
         *  n - I = -I
         *  0 - n = -n
         *  0 - 0 = 0
         *  0 - N = N
         *  0 - I = -I
         *  N - n = N
         *  N - 0 = N
         *  N - N = N
         *  N - I = N
         *  I - n = I
         *  I - 0 = I
         *  I - N = N
         *  I - I = N
         *
         * Return a new BigNumber whose value is the value of this BigNumber minus the value of
         * BigNumber(y, b).
         */
        P.minus = P.sub = function ( y, b ) {
            var i, j, t, xLTy,
                x = this,
                a = x.s;

            id = 10;
            y = new BigNumber( y, b );
            b = y.s;

            // Either NaN?
            if ( !a || !b ) return new BigNumber(NaN);

            // Signs differ?
            if ( a != b ) {
                y.s = -b;
                return x.plus(y);
            }

            var xe = x.e / LOG_BASE,
                ye = y.e / LOG_BASE,
                xc = x.c,
                yc = y.c;

            if ( !xe || !ye ) {

                // Either Infinity?
                if ( !xc || !yc ) return xc ? ( y.s = -b, y ) : new BigNumber( yc ? x : NaN );

                // Either zero?
                if ( !xc[0] || !yc[0] ) {

                    // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
                    return yc[0] ? ( y.s = -b, y ) : new BigNumber( xc[0] ? x :

                      // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
                      ROUNDING_MODE == 3 ? -0 : 0 );
                }
            }

            xe = bitFloor(xe);
            ye = bitFloor(ye);
            xc = xc.slice();

            // Determine which is the bigger number.
            if ( a = xe - ye ) {

                if ( xLTy = a < 0 ) {
                    a = -a;
                    t = xc;
                } else {
                    ye = xe;
                    t = yc;
                }

                t.reverse();

                // Prepend zeros to equalise exponents.
                for ( b = a; b--; t.push(0) );
                t.reverse();
            } else {

                // Exponents equal. Check digit by digit.
                j = ( xLTy = ( a = xc.length ) < ( b = yc.length ) ) ? a : b;

                for ( a = b = 0; b < j; b++ ) {

                    if ( xc[b] != yc[b] ) {
                        xLTy = xc[b] < yc[b];
                        break;
                    }
                }
            }

            // x < y? Point xc to the array of the bigger number.
            if (xLTy) t = xc, xc = yc, yc = t, y.s = -y.s;

            b = ( j = yc.length ) - ( i = xc.length );

            // Append zeros to xc if shorter.
            // No need to add zeros to yc if shorter as subtract only needs to start at yc.length.
            if ( b > 0 ) for ( ; b--; xc[i++] = 0 );
            b = BASE - 1;

            // Subtract yc from xc.
            for ( ; j > a; ) {

                if ( xc[--j] < yc[j] ) {
                    for ( i = j; i && !xc[--i]; xc[i] = b );
                    --xc[i];
                    xc[j] += BASE;
                }

                xc[j] -= yc[j];
            }

            // Remove leading zeros and adjust exponent accordingly.
            for ( ; xc[0] == 0; xc.shift(), --ye );

            // Zero?
            if ( !xc[0] ) {

                // Following IEEE 754 (2008) 6.3,
                // n - n = +0  but  n - n = -0  when rounding towards -Infinity.
                y.s = ROUNDING_MODE == 3 ? -1 : 1;
                y.c = [ y.e = 0 ];
                return y;
            }

            // No need to check for Infinity as +x - +y != Infinity && -x - -y != Infinity
            // for finite x and y.
            return normalise( y, xc, ye );
        };


        /*
         *   n % 0 =  N
         *   n % N =  N
         *   n % I =  n
         *   0 % n =  0
         *  -0 % n = -0
         *   0 % 0 =  N
         *   0 % N =  N
         *   0 % I =  0
         *   N % n =  N
         *   N % 0 =  N
         *   N % N =  N
         *   N % I =  N
         *   I % n =  N
         *   I % 0 =  N
         *   I % N =  N
         *   I % I =  N
         *
         * Return a new BigNumber whose value is the value of this BigNumber modulo the value of
         * BigNumber(y, b). The result depends on the value of MODULO_MODE.
         */
        P.modulo = P.mod = function ( y, b ) {
            var q, s,
                x = this;

            id = 11;
            y = new BigNumber( y, b );

            // Return NaN if x is Infinity or NaN, or y is NaN or zero.
            if ( !x.c || !y.s || y.c && !y.c[0] ) {
                return new BigNumber(NaN);

            // Return x if y is Infinity or x is zero.
            } else if ( !y.c || x.c && !x.c[0] ) {
                return new BigNumber(x);
            }

            if ( MODULO_MODE == 9 ) {

                // Euclidian division: q = sign(y) * floor(x / abs(y))
                // r = x - qy    where  0 <= r < abs(y)
                s = y.s;
                y.s = 1;
                q = div( x, y, 0, 3 );
                y.s = s;
                q.s *= s;
            } else {
                q = div( x, y, 0, MODULO_MODE );
            }

            return x.minus( q.times(y) );
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber negated,
         * i.e. multiplied by -1.
         */
        P.negated = P.neg = function () {
            var x = new BigNumber(this);
            x.s = -x.s || null;
            return x;
        };


        /*
         *  n + 0 = n
         *  n + N = N
         *  n + I = I
         *  0 + n = n
         *  0 + 0 = 0
         *  0 + N = N
         *  0 + I = I
         *  N + n = N
         *  N + 0 = N
         *  N + N = N
         *  N + I = N
         *  I + n = I
         *  I + 0 = I
         *  I + N = N
         *  I + I = I
         *
         * Return a new BigNumber whose value is the value of this BigNumber plus the value of
         * BigNumber(y, b).
         */
        P.plus = P.add = function ( y, b ) {
            var t,
                x = this,
                a = x.s;

            id = 12;
            y = new BigNumber( y, b );
            b = y.s;

            // Either NaN?
            if ( !a || !b ) return new BigNumber(NaN);

            // Signs differ?
             if ( a != b ) {
                y.s = -b;
                return x.minus(y);
            }

            var xe = x.e / LOG_BASE,
                ye = y.e / LOG_BASE,
                xc = x.c,
                yc = y.c;

            if ( !xe || !ye ) {

                // Return ±Infinity if either ±Infinity.
                if ( !xc || !yc ) return new BigNumber( a / 0 );

                // Either zero?
                // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
                if ( !xc[0] || !yc[0] ) return yc[0] ? y : new BigNumber( xc[0] ? x : a * 0 );
            }

            xe = bitFloor(xe);
            ye = bitFloor(ye);
            xc = xc.slice();

            // Prepend zeros to equalise exponents. Faster to use reverse then do unshifts.
            if ( a = xe - ye ) {
                if ( a > 0 ) {
                    ye = xe;
                    t = yc;
                } else {
                    a = -a;
                    t = xc;
                }

                t.reverse();
                for ( ; a--; t.push(0) );
                t.reverse();
            }

            a = xc.length;
            b = yc.length;

            // Point xc to the longer array, and b to the shorter length.
            if ( a - b < 0 ) t = yc, yc = xc, xc = t, b = a;

            // Only start adding at yc.length - 1 as the further digits of xc can be ignored.
            for ( a = 0; b; ) {
                a = ( xc[--b] = xc[b] + yc[b] + a ) / BASE | 0;
                xc[b] %= BASE;
            }

            if (a) {
                xc.unshift(a);
                ++ye;
            }

            // No need to check for zero, as +x + +y != 0 && -x + -y != 0
            // ye = MAX_EXP + 1 possible
            return normalise( y, xc, ye );
        };


        /*
         * Return the number of significant digits of the value of this BigNumber.
         *
         * [z] {boolean|number} Whether to count integer-part trailing zeros: true, false, 1 or 0.
         */
        P.precision = P.sd = function (z) {
            var n, v,
                x = this,
                c = x.c;

            // 'precision() argument not a boolean or binary digit: {z}'
            if ( z != null && z !== !!z && z !== 1 && z !== 0 ) {
                if (ERRORS) raise( 13, 'argument' + notBool, z );
                if ( z != !!z ) z = null;
            }

            if ( !c ) return null;
            v = c.length - 1;
            n = v * LOG_BASE + 1;

            if ( v = c[v] ) {

                // Subtract the number of trailing zeros of the last element.
                for ( ; v % 10 == 0; v /= 10, n-- );

                // Add the number of digits of the first element.
                for ( v = c[0]; v >= 10; v /= 10, n++ );
            }

            if ( z && x.e + 1 > n ) n = x.e + 1;

            return n;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a maximum of
         * dp decimal places using rounding mode rm, or to 0 and ROUNDING_MODE respectively if
         * omitted.
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'round() decimal places out of range: {dp}'
         * 'round() decimal places not an integer: {dp}'
         * 'round() rounding mode not an integer: {rm}'
         * 'round() rounding mode out of range: {rm}'
         */
        P.round = function ( dp, rm ) {
            var n = new BigNumber(this);

            if ( dp == null || isValidInt( dp, 0, MAX, 15 ) ) {
                round( n, ~~dp + this.e + 1, rm == null ||
                  !isValidInt( rm, 0, 8, 15, roundingMode ) ? ROUNDING_MODE : rm | 0 );
            }

            return n;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber shifted by k places
         * (powers of 10). Shift to the right if n > 0, and to the left if n < 0.
         *
         * k {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
         *
         * If k is out of range and ERRORS is false, the result will be ±0 if k < 0, or ±Infinity
         * otherwise.
         *
         * 'shift() argument not an integer: {k}'
         * 'shift() argument out of range: {k}'
         */
        P.shift = function (k) {
            var n = this;
            return isValidInt( k, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER, 16, 'argument' )

              // k < 1e+21, or truncate(k) will produce exponential notation.
              ? n.times( '1e' + truncate(k) )
              : new BigNumber( n.c && n.c[0] && ( k < -MAX_SAFE_INTEGER || k > MAX_SAFE_INTEGER )
                ? n.s * ( k < 0 ? 0 : 1 / 0 )
                : n );
        };


        /*
         *  sqrt(-n) =  N
         *  sqrt( N) =  N
         *  sqrt(-I) =  N
         *  sqrt( I) =  I
         *  sqrt( 0) =  0
         *  sqrt(-0) = -0
         *
         * Return a new BigNumber whose value is the square root of the value of this BigNumber,
         * rounded according to DECIMAL_PLACES and ROUNDING_MODE.
         */
        P.squareRoot = P.sqrt = function () {
            var m, n, r, rep, t,
                x = this,
                c = x.c,
                s = x.s,
                e = x.e,
                dp = DECIMAL_PLACES + 4,
                half = new BigNumber('0.5');

            // Negative/NaN/Infinity/zero?
            if ( s !== 1 || !c || !c[0] ) {
                return new BigNumber( !s || s < 0 && ( !c || c[0] ) ? NaN : c ? x : 1 / 0 );
            }

            // Initial estimate.
            s = Math.sqrt( +x );

            // Math.sqrt underflow/overflow?
            // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
            if ( s == 0 || s == 1 / 0 ) {
                n = coeffToString(c);
                if ( ( n.length + e ) % 2 == 0 ) n += '0';
                s = Math.sqrt(n);
                e = bitFloor( ( e + 1 ) / 2 ) - ( e < 0 || e % 2 );

                if ( s == 1 / 0 ) {
                    n = '1e' + e;
                } else {
                    n = s.toExponential();
                    n = n.slice( 0, n.indexOf('e') + 1 ) + e;
                }

                r = new BigNumber(n);
            } else {
                r = new BigNumber( s + '' );
            }

            // Check for zero.
            // r could be zero if MIN_EXP is changed after the this value was created.
            // This would cause a division by zero (x/t) and hence Infinity below, which would cause
            // coeffToString to throw.
            if ( r.c[0] ) {
                e = r.e;
                s = e + dp;
                if ( s < 3 ) s = 0;

                // Newton-Raphson iteration.
                for ( ; ; ) {
                    t = r;
                    r = half.times( t.plus( div( x, t, dp, 1 ) ) );

                    if ( coeffToString( t.c   ).slice( 0, s ) === ( n =
                         coeffToString( r.c ) ).slice( 0, s ) ) {

                        // The exponent of r may here be one less than the final result exponent,
                        // e.g 0.0009999 (e-4) --> 0.001 (e-3), so adjust s so the rounding digits
                        // are indexed correctly.
                        if ( r.e < e ) --s;
                        n = n.slice( s - 3, s + 1 );

                        // The 4th rounding digit may be in error by -1 so if the 4 rounding digits
                        // are 9999 or 4999 (i.e. approaching a rounding boundary) continue the
                        // iteration.
                        if ( n == '9999' || !rep && n == '4999' ) {

                            // On the first iteration only, check to see if rounding up gives the
                            // exact result as the nines may infinitely repeat.
                            if ( !rep ) {
                                round( t, t.e + DECIMAL_PLACES + 2, 0 );

                                if ( t.times(t).eq(x) ) {
                                    r = t;
                                    break;
                                }
                            }

                            dp += 4;
                            s += 4;
                            rep = 1;
                        } else {

                            // If rounding digits are null, 0{0,4} or 50{0,3}, check for exact
                            // result. If not, then there are further digits and m will be truthy.
                            if ( !+n || !+n.slice(1) && n.charAt(0) == '5' ) {

                                // Truncate to the first rounding digit.
                                round( r, r.e + DECIMAL_PLACES + 2, 1 );
                                m = !r.times(r).eq(x);
                            }

                            break;
                        }
                    }
                }
            }

            return round( r, r.e + DECIMAL_PLACES + 1, ROUNDING_MODE, m );
        };


        /*
         *  n * 0 = 0
         *  n * N = N
         *  n * I = I
         *  0 * n = 0
         *  0 * 0 = 0
         *  0 * N = N
         *  0 * I = N
         *  N * n = N
         *  N * 0 = N
         *  N * N = N
         *  N * I = N
         *  I * n = I
         *  I * 0 = N
         *  I * N = N
         *  I * I = I
         *
         * Return a new BigNumber whose value is the value of this BigNumber times the value of
         * BigNumber(y, b).
         */
        P.times = P.mul = function ( y, b ) {
            var c, e, i, j, k, m, xcL, xlo, xhi, ycL, ylo, yhi, zc,
                base, sqrtBase,
                x = this,
                xc = x.c,
                yc = ( id = 17, y = new BigNumber( y, b ) ).c;

            // Either NaN, ±Infinity or ±0?
            if ( !xc || !yc || !xc[0] || !yc[0] ) {

                // Return NaN if either is NaN, or one is 0 and the other is Infinity.
                if ( !x.s || !y.s || xc && !xc[0] && !yc || yc && !yc[0] && !xc ) {
                    y.c = y.e = y.s = null;
                } else {
                    y.s *= x.s;

                    // Return ±Infinity if either is ±Infinity.
                    if ( !xc || !yc ) {
                        y.c = y.e = null;

                    // Return ±0 if either is ±0.
                    } else {
                        y.c = [0];
                        y.e = 0;
                    }
                }

                return y;
            }

            e = bitFloor( x.e / LOG_BASE ) + bitFloor( y.e / LOG_BASE );
            y.s *= x.s;
            xcL = xc.length;
            ycL = yc.length;

            // Ensure xc points to longer array and xcL to its length.
            if ( xcL < ycL ) zc = xc, xc = yc, yc = zc, i = xcL, xcL = ycL, ycL = i;

            // Initialise the result array with zeros.
            for ( i = xcL + ycL, zc = []; i--; zc.push(0) );

            base = BASE;
            sqrtBase = SQRT_BASE;

            for ( i = ycL; --i >= 0; ) {
                c = 0;
                ylo = yc[i] % sqrtBase;
                yhi = yc[i] / sqrtBase | 0;

                for ( k = xcL, j = i + k; j > i; ) {
                    xlo = xc[--k] % sqrtBase;
                    xhi = xc[k] / sqrtBase | 0;
                    m = yhi * xlo + xhi * ylo;
                    xlo = ylo * xlo + ( ( m % sqrtBase ) * sqrtBase ) + zc[j] + c;
                    c = ( xlo / base | 0 ) + ( m / sqrtBase | 0 ) + yhi * xhi;
                    zc[j--] = xlo % base;
                }

                zc[j] = c;
            }

            if (c) {
                ++e;
            } else {
                zc.shift();
            }

            return normalise( y, zc, e );
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a maximum of
         * sd significant digits using rounding mode rm, or ROUNDING_MODE if rm is omitted.
         *
         * [sd] {number} Significant digits. Integer, 1 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toDigits() precision out of range: {sd}'
         * 'toDigits() precision not an integer: {sd}'
         * 'toDigits() rounding mode not an integer: {rm}'
         * 'toDigits() rounding mode out of range: {rm}'
         */
        P.toDigits = function ( sd, rm ) {
            var n = new BigNumber(this);
            sd = sd == null || !isValidInt( sd, 1, MAX, 18, 'precision' ) ? null : sd | 0;
            rm = rm == null || !isValidInt( rm, 0, 8, 18, roundingMode ) ? ROUNDING_MODE : rm | 0;
            return sd ? round( n, sd, rm ) : n;
        };


        /*
         * Return a string representing the value of this BigNumber in exponential notation and
         * rounded using ROUNDING_MODE to dp fixed decimal places.
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toExponential() decimal places not an integer: {dp}'
         * 'toExponential() decimal places out of range: {dp}'
         * 'toExponential() rounding mode not an integer: {rm}'
         * 'toExponential() rounding mode out of range: {rm}'
         */
        P.toExponential = function ( dp, rm ) {
            return format( this,
              dp != null && isValidInt( dp, 0, MAX, 19 ) ? ~~dp + 1 : null, rm, 19 );
        };


        /*
         * Return a string representing the value of this BigNumber in fixed-point notation rounding
         * to dp fixed decimal places using rounding mode rm, or ROUNDING_MODE if rm is omitted.
         *
         * Note: as with JavaScript's number type, (-0).toFixed(0) is '0',
         * but e.g. (-0.00001).toFixed(0) is '-0'.
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toFixed() decimal places not an integer: {dp}'
         * 'toFixed() decimal places out of range: {dp}'
         * 'toFixed() rounding mode not an integer: {rm}'
         * 'toFixed() rounding mode out of range: {rm}'
         */
        P.toFixed = function ( dp, rm ) {
            return format( this, dp != null && isValidInt( dp, 0, MAX, 20 )
              ? ~~dp + this.e + 1 : null, rm, 20 );
        };


        /*
         * Return a string representing the value of this BigNumber in fixed-point notation rounded
         * using rm or ROUNDING_MODE to dp decimal places, and formatted according to the properties
         * of the FORMAT object (see BigNumber.config).
         *
         * FORMAT = {
         *      decimalSeparator : '.',
         *      groupSeparator : ',',
         *      groupSize : 3,
         *      secondaryGroupSize : 0,
         *      fractionGroupSeparator : '\xA0',    // non-breaking space
         *      fractionGroupSize : 0
         * };
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toFormat() decimal places not an integer: {dp}'
         * 'toFormat() decimal places out of range: {dp}'
         * 'toFormat() rounding mode not an integer: {rm}'
         * 'toFormat() rounding mode out of range: {rm}'
         */
        P.toFormat = function ( dp, rm ) {
            var str = format( this, dp != null && isValidInt( dp, 0, MAX, 21 )
              ? ~~dp + this.e + 1 : null, rm, 21 );

            if ( this.c ) {
                var i,
                    arr = str.split('.'),
                    g1 = +FORMAT.groupSize,
                    g2 = +FORMAT.secondaryGroupSize,
                    groupSeparator = FORMAT.groupSeparator,
                    intPart = arr[0],
                    fractionPart = arr[1],
                    isNeg = this.s < 0,
                    intDigits = isNeg ? intPart.slice(1) : intPart,
                    len = intDigits.length;

                if (g2) i = g1, g1 = g2, g2 = i, len -= i;

                if ( g1 > 0 && len > 0 ) {
                    i = len % g1 || g1;
                    intPart = intDigits.substr( 0, i );

                    for ( ; i < len; i += g1 ) {
                        intPart += groupSeparator + intDigits.substr( i, g1 );
                    }

                    if ( g2 > 0 ) intPart += groupSeparator + intDigits.slice(i);
                    if (isNeg) intPart = '-' + intPart;
                }

                str = fractionPart
                  ? intPart + FORMAT.decimalSeparator + ( ( g2 = +FORMAT.fractionGroupSize )
                    ? fractionPart.replace( new RegExp( '\\d{' + g2 + '}\\B', 'g' ),
                      '$&' + FORMAT.fractionGroupSeparator )
                    : fractionPart )
                  : intPart;
            }

            return str;
        };


        /*
         * Return a string array representing the value of this BigNumber as a simple fraction with
         * an integer numerator and an integer denominator. The denominator will be a positive
         * non-zero value less than or equal to the specified maximum denominator. If a maximum
         * denominator is not specified, the denominator will be the lowest value necessary to
         * represent the number exactly.
         *
         * [md] {number|string|BigNumber} Integer >= 1 and < Infinity. The maximum denominator.
         *
         * 'toFraction() max denominator not an integer: {md}'
         * 'toFraction() max denominator out of range: {md}'
         */
        P.toFraction = function (md) {
            var arr, d0, d2, e, exp, n, n0, q, s,
                k = ERRORS,
                x = this,
                xc = x.c,
                d = new BigNumber(ONE),
                n1 = d0 = new BigNumber(ONE),
                d1 = n0 = new BigNumber(ONE);

            if ( md != null ) {
                ERRORS = false;
                n = new BigNumber(md);
                ERRORS = k;

                if ( !( k = n.isInt() ) || n.lt(ONE) ) {

                    if (ERRORS) {
                        raise( 22,
                          'max denominator ' + ( k ? 'out of range' : 'not an integer' ), md );
                    }

                    // ERRORS is false:
                    // If md is a finite non-integer >= 1, round it to an integer and use it.
                    md = !k && n.c && round( n, n.e + 1, 1 ).gte(ONE) ? n : null;
                }
            }

            if ( !xc ) return x.toString();
            s = coeffToString(xc);

            // Determine initial denominator.
            // d is a power of 10 and the minimum max denominator that specifies the value exactly.
            e = d.e = s.length - x.e - 1;
            d.c[0] = POWS_TEN[ ( exp = e % LOG_BASE ) < 0 ? LOG_BASE + exp : exp ];
            md = !md || n.cmp(d) > 0 ? ( e > 0 ? d : n1 ) : n;

            exp = MAX_EXP;
            MAX_EXP = 1 / 0;
            n = new BigNumber(s);

            // n0 = d1 = 0
            n0.c[0] = 0;

            for ( ; ; )  {
                q = div( n, d, 0, 1 );
                d2 = d0.plus( q.times(d1) );
                if ( d2.cmp(md) == 1 ) break;
                d0 = d1;
                d1 = d2;
                n1 = n0.plus( q.times( d2 = n1 ) );
                n0 = d2;
                d = n.minus( q.times( d2 = d ) );
                n = d2;
            }

            d2 = div( md.minus(d0), d1, 0, 1 );
            n0 = n0.plus( d2.times(n1) );
            d0 = d0.plus( d2.times(d1) );
            n0.s = n1.s = x.s;
            e *= 2;

            // Determine which fraction is closer to x, n0/d0 or n1/d1
            arr = div( n1, d1, e, ROUNDING_MODE ).minus(x).abs().cmp(
                  div( n0, d0, e, ROUNDING_MODE ).minus(x).abs() ) < 1
                    ? [ n1.toString(), d1.toString() ]
                    : [ n0.toString(), d0.toString() ];

            MAX_EXP = exp;
            return arr;
        };


        /*
         * Return the value of this BigNumber converted to a number primitive.
         */
        P.toNumber = function () {
            return +this;
        };


        /*
         * Return a BigNumber whose value is the value of this BigNumber raised to the power n.
         * If m is present, return the result modulo m.
         * If n is negative round according to DECIMAL_PLACES and ROUNDING_MODE.
         * If POW_PRECISION is non-zero and m is not present, round to POW_PRECISION using
         * ROUNDING_MODE.
         *
         * The modular power operation works efficiently when x, n, and m are positive integers,
         * otherwise it is equivalent to calculating x.toPower(n).modulo(m) (with POW_PRECISION 0).
         *
         * n {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
         * [m] {number|string|BigNumber} The modulus.
         *
         * 'pow() exponent not an integer: {n}'
         * 'pow() exponent out of range: {n}'
         *
         * Performs 54 loop iterations for n of 9007199254740991.
         */
        P.toPower = P.pow = function ( n, m ) {
            var k, y, z,
                i = mathfloor( n < 0 ? -n : +n ),
                x = this;

            if ( m != null ) {
                id = 23;
                m = new BigNumber(m);
            }

            // Pass ±Infinity to Math.pow if exponent is out of range.
            if ( !isValidInt( n, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER, 23, 'exponent' ) &&
              ( !isFinite(n) || i > MAX_SAFE_INTEGER && ( n /= 0 ) ||
                parseFloat(n) != n && !( n = NaN ) ) || n == 0 ) {
                k = Math.pow( +x, n );
                return new BigNumber( m ? k % m : k );
            }

            if (m) {
                if ( n > 1 && x.gt(ONE) && x.isInt() && m.gt(ONE) && m.isInt() ) {
                    x = x.mod(m);
                } else {
                    z = m;

                    // Nullify m so only a single mod operation is performed at the end.
                    m = null;
                }
            } else if (POW_PRECISION) {

                // Truncating each coefficient array to a length of k after each multiplication
                // equates to truncating significant digits to POW_PRECISION + [28, 41],
                // i.e. there will be a minimum of 28 guard digits retained.
                // (Using + 1.5 would give [9, 21] guard digits.)
                k = mathceil( POW_PRECISION / LOG_BASE + 2 );
            }

            y = new BigNumber(ONE);

            for ( ; ; ) {
                if ( i % 2 ) {
                    y = y.times(x);
                    if ( !y.c ) break;
                    if (k) {
                        if ( y.c.length > k ) y.c.length = k;
                    } else if (m) {
                        y = y.mod(m);
                    }
                }

                i = mathfloor( i / 2 );
                if ( !i ) break;
                x = x.times(x);
                if (k) {
                    if ( x.c && x.c.length > k ) x.c.length = k;
                } else if (m) {
                    x = x.mod(m);
                }
            }

            if (m) return y;
            if ( n < 0 ) y = ONE.div(y);

            return z ? y.mod(z) : k ? round( y, POW_PRECISION, ROUNDING_MODE ) : y;
        };


        /*
         * Return a string representing the value of this BigNumber rounded to sd significant digits
         * using rounding mode rm or ROUNDING_MODE. If sd is less than the number of digits
         * necessary to represent the integer part of the value in fixed-point notation, then use
         * exponential notation.
         *
         * [sd] {number} Significant digits. Integer, 1 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toPrecision() precision not an integer: {sd}'
         * 'toPrecision() precision out of range: {sd}'
         * 'toPrecision() rounding mode not an integer: {rm}'
         * 'toPrecision() rounding mode out of range: {rm}'
         */
        P.toPrecision = function ( sd, rm ) {
            return format( this, sd != null && isValidInt( sd, 1, MAX, 24, 'precision' )
              ? sd | 0 : null, rm, 24 );
        };


        /*
         * Return a string representing the value of this BigNumber in base b, or base 10 if b is
         * omitted. If a base is specified, including base 10, round according to DECIMAL_PLACES and
         * ROUNDING_MODE. If a base is not specified, and this BigNumber has a positive exponent
         * that is equal to or greater than TO_EXP_POS, or a negative exponent equal to or less than
         * TO_EXP_NEG, return exponential notation.
         *
         * [b] {number} Integer, 2 to 64 inclusive.
         *
         * 'toString() base not an integer: {b}'
         * 'toString() base out of range: {b}'
         */
        P.toString = function (b) {
            var str,
                n = this,
                s = n.s,
                e = n.e;

            // Infinity or NaN?
            if ( e === null ) {

                if (s) {
                    str = 'Infinity';
                    if ( s < 0 ) str = '-' + str;
                } else {
                    str = 'NaN';
                }
            } else {
                str = coeffToString( n.c );

                if ( b == null || !isValidInt( b, 2, 64, 25, 'base' ) ) {
                    str = e <= TO_EXP_NEG || e >= TO_EXP_POS
                      ? toExponential( str, e )
                      : toFixedPoint( str, e );
                } else {
                    str = convertBase( toFixedPoint( str, e ), b | 0, 10, s );
                }

                if ( s < 0 && n.c[0] ) str = '-' + str;
            }

            return str;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber truncated to a whole
         * number.
         */
        P.truncated = P.trunc = function () {
            return round( new BigNumber(this), this.e + 1, 1 );
        };



        /*
         * Return as toString, but do not accept a base argument, and include the minus sign for
         * negative zero.
         */
        P.valueOf = P.toJSON = function () {
            var str,
                n = this,
                e = n.e;

            if ( e === null ) return n.toString();

            str = coeffToString( n.c );

            str = e <= TO_EXP_NEG || e >= TO_EXP_POS
                ? toExponential( str, e )
                : toFixedPoint( str, e );

            return n.s < 0 ? '-' + str : str;
        };


        // Aliases for BigDecimal methods.
        //P.add = P.plus;         // P.add included above
        //P.subtract = P.minus;   // P.sub included above
        //P.multiply = P.times;   // P.mul included above
        //P.divide = P.div;
        //P.remainder = P.mod;
        //P.compareTo = P.cmp;
        //P.negate = P.neg;


        if ( configObj != null ) BigNumber.config(configObj);

        return BigNumber;
    }


    // PRIVATE HELPER FUNCTIONS


    function bitFloor(n) {
        var i = n | 0;
        return n > 0 || n === i ? i : i - 1;
    }


    // Return a coefficient array as a string of base 10 digits.
    function coeffToString(a) {
        var s, z,
            i = 1,
            j = a.length,
            r = a[0] + '';

        for ( ; i < j; ) {
            s = a[i++] + '';
            z = LOG_BASE - s.length;
            for ( ; z--; s = '0' + s );
            r += s;
        }

        // Determine trailing zeros.
        for ( j = r.length; r.charCodeAt(--j) === 48; );
        return r.slice( 0, j + 1 || 1 );
    }


    // Compare the value of BigNumbers x and y.
    function compare( x, y ) {
        var a, b,
            xc = x.c,
            yc = y.c,
            i = x.s,
            j = y.s,
            k = x.e,
            l = y.e;

        // Either NaN?
        if ( !i || !j ) return null;

        a = xc && !xc[0];
        b = yc && !yc[0];

        // Either zero?
        if ( a || b ) return a ? b ? 0 : -j : i;

        // Signs differ?
        if ( i != j ) return i;

        a = i < 0;
        b = k == l;

        // Either Infinity?
        if ( !xc || !yc ) return b ? 0 : !xc ^ a ? 1 : -1;

        // Compare exponents.
        if ( !b ) return k > l ^ a ? 1 : -1;

        j = ( k = xc.length ) < ( l = yc.length ) ? k : l;

        // Compare digit by digit.
        for ( i = 0; i < j; i++ ) if ( xc[i] != yc[i] ) return xc[i] > yc[i] ^ a ? 1 : -1;

        // Compare lengths.
        return k == l ? 0 : k > l ^ a ? 1 : -1;
    }


    /*
     * Return true if n is a valid number in range, otherwise false.
     * Use for argument validation when ERRORS is false.
     * Note: parseInt('1e+1') == 1 but parseFloat('1e+1') == 10.
     */
    function intValidatorNoErrors( n, min, max ) {
        return ( n = truncate(n) ) >= min && n <= max;
    }


    function isArray(obj) {
        return Object.prototype.toString.call(obj) == '[object Array]';
    }


    /*
     * Convert string of baseIn to an array of numbers of baseOut.
     * Eg. convertBase('255', 10, 16) returns [15, 15].
     * Eg. convertBase('ff', 16, 10) returns [2, 5, 5].
     */
    function toBaseOut( str, baseIn, baseOut ) {
        var j,
            arr = [0],
            arrL,
            i = 0,
            len = str.length;

        for ( ; i < len; ) {
            for ( arrL = arr.length; arrL--; arr[arrL] *= baseIn );
            arr[ j = 0 ] += ALPHABET.indexOf( str.charAt( i++ ) );

            for ( ; j < arr.length; j++ ) {

                if ( arr[j] > baseOut - 1 ) {
                    if ( arr[j + 1] == null ) arr[j + 1] = 0;
                    arr[j + 1] += arr[j] / baseOut | 0;
                    arr[j] %= baseOut;
                }
            }
        }

        return arr.reverse();
    }


    function toExponential( str, e ) {
        return ( str.length > 1 ? str.charAt(0) + '.' + str.slice(1) : str ) +
          ( e < 0 ? 'e' : 'e+' ) + e;
    }


    function toFixedPoint( str, e ) {
        var len, z;

        // Negative exponent?
        if ( e < 0 ) {

            // Prepend zeros.
            for ( z = '0.'; ++e; z += '0' );
            str = z + str;

        // Positive exponent
        } else {
            len = str.length;

            // Append zeros.
            if ( ++e > len ) {
                for ( z = '0', e -= len; --e; z += '0' );
                str += z;
            } else if ( e < len ) {
                str = str.slice( 0, e ) + '.' + str.slice(e);
            }
        }

        return str;
    }


    function truncate(n) {
        n = parseFloat(n);
        return n < 0 ? mathceil(n) : mathfloor(n);
    }


    // EXPORT


    BigNumber = constructorFactory();
    BigNumber.default = BigNumber.BigNumber = BigNumber;


    // AMD.
    if ( typeof define == 'function' && define.amd ) {
        define( function () { return BigNumber; } );

    // Node.js and other environments that support module.exports.
    } else if ( typeof module != 'undefined' && module.exports ) {
        module.exports = BigNumber;

        // Split string stops browserify adding crypto shim.
        if ( !cryptoObj ) try { cryptoObj = require('cry' + 'pto'); } catch (e) {}

    // Browser.
    } else {
        if ( !globalObj ) globalObj = typeof self != 'undefined' ? self : Function('return this')();
        globalObj.BigNumber = BigNumber;
    }
})(this);

},{}],"../node_modules/number-names/index.js":[function(require,module,exports) {
var cache = require('./lib/cache');
var lots = require('./lib/lots');
var bigNumber = require('bignumber.js');

var n2w = function(num) {
  var number = new bigNumber(num);

  var temp = number;
  number = number.trunc();
  var o = '';

  if (number.lt(0)) {
    o += 'negative ';
    number = number.times(-1);
  }

  if (number.equals(0)) {
    o += 'zero';
  } else {
    var sets = [];
    var i = 0;
    var f = false;

    while (!number.equals(0)) {

      r = number.mod(1000);
      number = number.dividedBy(1000).floor();

      if (!(r.equals(0) || i === 0)) {
        sets.push(lots[i] + (!(sets.length === 0) ? (f ? ' and' : ',') : ''));
      }

      if (i === 0 && r.lt(100)) {
        f = true;
      }

      if (!r.equals(0)) {
        sets.push(cache[r]);
      }
      i = i + 1;
    }
    o += sets.reverse().join(' ');
  }

  var decimal = temp.mod(1).toString();
  if(decimal !== '0') {
    decimal = decimal.split('.')[1];
    o += ' point'
    // The number has a decimal portion
    decimal.split('').forEach(function(digit) {
      o += ' ' + cache[digit];
    });
  }
  return o;
}

module.exports = n2w;

},{"./lib/cache":"../node_modules/number-names/lib/cache.js","./lib/lots":"../node_modules/number-names/lib/lots.js","bignumber.js":"../node_modules/bignumber.js/bignumber.js"}],"js.js":[function(require,module,exports) {
"use strict";

var _fs = require("fs");

var _pluralize = _interopRequireDefault(require("pluralize"));

var _numberNames = _interopRequireDefault(require("number-names"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var randomArrKey = function randomArrKey(items) {
  return items[Math.floor(Math.random() * items.length)];
};

var wordList = "ATM\nCD\nSUV\nTV\naardvark\nabacus\nabbey\nabbreviation\nabdomen\nability\nabnormality\nabolishment\nabortion\nabrogation\nabsence\nabundance\nabuse\nacademics\nacademy\naccelerant\naccelerator\naccent\nacceptance\naccess\naccessory\naccident\naccommodation\naccompanist\naccomplishment\naccord\naccordance\naccordion\naccount\naccountability\naccountant\naccounting\naccuracy\naccusation\nacetate\nachievement\nachiever\nacid\nacknowledgment\nacorn\nacoustics\nacquaintance\nacquisition\nacre\nacrylic\nact\naction\nactivation\nactivist\nactivity\nactor\nactress\nacupuncture\nad\nadaptation\nadapter\naddiction\naddition\naddress\nadjective\nadjustment\nadmin\nadministration\nadministrator\nadmire\nadmission\nadobe\nadoption\nadrenalin\nadrenaline\nadult\nadulthood\nadvance\nadvancement\nadvantage\nadvent\nadverb\nadvertisement\nadvertising\nadvice\nadviser\nadvocacy\nadvocate\naffair\naffect\naffidavit\naffiliate\naffinity\nafoul\nafterlife\naftermath\nafternoon\naftershave\naftershock\nafterthought\nage\nagency\nagenda\nagent\naggradation\naggression\naglet\nagony\nagreement\nagriculture\naid\naide\naim\nair\nairbag\nairbus\naircraft\nairfare\nairfield\nairforce\nairline\nairmail\nairman\nairplane\nairport\nairship\nairspace\nalarm\nalb\nalbatross\nalbum\nalcohol\nalcove\nalder\nale\nalert\nalfalfa\nalgebra\nalgorithm\nalias\nalibi\nalien\nallegation\nallergist\nalley\nalliance\nalligator\nallocation\nallowance\nalloy\nalluvium\nalmanac\nalmighty\nalmond\nalpaca\nalpenglow\nalpenhorn\nalpha\nalphabet\naltar\nalteration\nalternative\naltitude\nalto\naluminium\naluminum\namazement\namazon\nambassador\namber\nambience\nambiguity\nambition\nambulance\namendment\namenity\nammunition\namnesty\namount\namusement\nanagram\nanalgesia\nanalog\nanalogue\nanalogy\nanalysis\nanalyst\nanalytics\nanarchist\nanarchy\nanatomy\nancestor\nanchovy\nandroid\nanesthesiologist\nanesthesiology\nangel\nanger\nangina\nangiosperm\nangle\nangora\nangstrom\nanguish\nanimal\nanime\nanise\nankle\nanklet\nanniversary\nannouncement\nannual\nanorak\nanswer\nant\nanteater\nantecedent\nantechamber\nantelope\nantennae\nanterior\nanthropology\nantibody\nanticipation\nanticodon\nantigen\nantique\nantiquity\nantler\nantling\nanxiety\nanybody\nanyone\nanything\nanywhere\napartment\nape\naperitif\napology\napp\napparatus\napparel\nappeal\nappearance\nappellation\nappendix\nappetiser\nappetite\nappetizer\napplause\napple\napplewood\nappliance\napplication\nappointment\nappreciation\napprehension\napproach\nappropriation\napproval\napricot\napron\napse\naquarium\naquifer\narcade\narch\narch-rival\narchaeologist\narchaeology\narcheology\narcher\narchitect\narchitecture\narchives\narea\narena\nargument\narithmetic\nark\narm\narm-rest\narmadillo\narmament\narmchair\narmoire\narmor\narmour\narmpit\narmrest\narmy\narrangement\narray\narrest\narrival\narrogance\narrow\nart\nartery\narthur\nartichoke\narticle\nartifact\nartificer\nartist\nascend\nascent\nascot\nash\nashram\nashtray\naside\nasparagus\naspect\nasphalt\naspic\nass\nassassination\nassault\nassembly\nassertion\nassessment\nasset\nassignment\nassist\nassistance\nassistant\nassociate\nassociation\nassumption\nassurance\nasterisk\nastrakhan\nastrolabe\nastrologer\nastrology\nastronomy\nasymmetry\natelier\natheist\nathlete\nathletics\natmosphere\natom\natrium\nattachment\nattack\nattacker\nattainment\nattempt\nattendance\nattendant\nattention\nattenuation\nattic\nattitude\nattorney\nattraction\nattribute\nauction\naudience\naudit\nauditorium\naunt\nauthentication\nauthenticity\nauthor\nauthorisation\nauthority\nauthorization\nauto\nautoimmunity\nautomation\nautomaton\nautumn\navailability\navalanche\navenue\naverage\navocado\naward\nawareness\nawe\naxis\nazimuth\nbabe\nbaboon\nbabushka\nbaby\nbachelor\nback\nback-up\nbackbone\nbackburn\nbackdrop\nbackground\nbackpack\nbackup\nbackyard\nbacon\nbacterium\nbadge\nbadger\nbafflement\nbag\nbagel\nbaggage\nbaggie\nbaggy\nbagpipe\nbail\nbait\nbake\nbaker\nbakery\nbakeware\nbalaclava\nbalalaika\nbalance\nbalcony\nball\nballet\nballoon\nballoonist\nballot\nballpark\nbamboo\nban\nbanana\nband\nbandana\nbandanna\nbandolier\nbandwidth\nbangle\nbanjo\nbank\nbankbook\nbanker\nbanking\nbankruptcy\nbanner\nbanquette\nbanyan\nbaobab\nbar\nbarbecue\nbarbeque\nbarber\nbarbiturate\nbargain\nbarge\nbaritone\nbarium\nbark\nbarley\nbarn\nbarometer\nbarracks\nbarrage\nbarrel\nbarrier\nbarstool\nbartender\nbase\nbaseball\nbaseboard\nbaseline\nbasement\nbasics\nbasil\nbasin\nbasis\nbasket\nbasketball\nbass\nbassinet\nbassoon\nbat\nbath\nbather\nbathhouse\nbathrobe\nbathroom\nbathtub\nbattalion\nbatter\nbattery\nbatting\nbattle\nbattleship\nbay\nbayou\nbeach\nbead\nbeak\nbeam\nbean\nbeancurd\nbeanie\nbeanstalk\nbear\nbeard\nbeast\nbeastie\nbeat\nbeating\nbeauty\nbeaver\nbeck\nbed\nbedrock\nbedroom\nbee\nbeech\nbeef\nbeer\nbeet\nbeetle\nbeggar\nbeginner\nbeginning\nbegonia\nbehalf\nbehavior\nbehaviour\nbeheading\nbehest\nbehold\nbeing\nbelfry\nbelief\nbeliever\nbell\nbelligerency\nbellows\nbelly\nbelt\nbench\nbend\nbeneficiary\nbenefit\nberet\nberry\nbest-seller\nbestseller\nbet\nbeverage\nbeyond\nbias\nbibliography\nbicycle\nbid\nbidder\nbidding\nbidet\nbifocals\nbijou\nbike\nbikini\nbill\nbillboard\nbilling\nbillion\nbin\nbinoculars\nbiology\nbiopsy\nbiosphere\nbiplane\nbirch\nbird\nbird-watcher\nbirdbath\nbirdcage\nbirdhouse\nbirth\nbirthday\nbiscuit\nbit\nbite\nbitten\nbitter\nblack\nblackberry\nblackbird\nblackboard\nblackfish\nblackness\nbladder\nblade\nblame\nblank\nblanket\nblast\nblazer\nblend\nblessing\nblight\nblind\nblinker\nblister\nblizzard\nblock\nblocker\nblog\nblogger\nblood\nbloodflow\nbloom\nbloomer\nblossom\nblouse\nblow\nblowgun\nblowhole\nblue\nblueberry\nblush\nboar\nboard\nboat\nboatload\nboatyard\nbob\nbobcat\nbody\nbog\nbolero\nbolt\nbomb\nbomber\nbombing\nbond\nbonding\nbondsman\nbone\nbonfire\nbongo\nbonnet\nbonsai\nbonus\nboogeyman\nbook\nbookcase\nbookend\nbooking\nbooklet\nbookmark\nboolean\nboom\nboon\nboost\nbooster\nboot\nbootee\nbootie\nbooty\nborder\nbore\nborrower\nborrowing\nbosom\nboss\nbotany\nbother\nbottle\nbottling\nbottom\nbottom-line\nboudoir\nbough\nboulder\nboulevard\nboundary\nbouquet\nbourgeoisie\nbout\nboutique\nbow\nbower\nbowl\nbowler\nbowling\nbowtie\nbox\nboxer\nboxspring\nboy\nboycott\nboyfriend\nboyhood\nboysenberry\nbra\nbrace\nbracelet\nbracket\nbrain\nbrake\nbran\nbranch\nbrand\nbrandy\nbrass\nbrassiere\nbratwurst\nbread\nbreadcrumb\nbreadfruit\nbreak\nbreakdown\nbreakfast\nbreakpoint\nbreakthrough\nbreast\nbreastplate\nbreath\nbreeze\nbrewer\nbribery\nbrick\nbricklaying\nbride\nbridge\nbrief\nbriefing\nbriefly\nbriefs\nbrilliant\nbrink\nbrisket\nbroad\nbroadcast\nbroccoli\nbrochure\nbrocolli\nbroiler\nbroker\nbronchitis\nbronco\nbronze\nbrooch\nbrood\nbrook\nbroom\nbrother\nbrother-in-law\nbrow\nbrown\nbrownie\nbrowser\nbrowsing\nbrunch\nbrush\nbrushfire\nbrushing\nbubble\nbuck\nbucket\nbuckle\nbuckwheat\nbud\nbuddy\nbudget\nbuffalo\nbuffer\nbuffet\nbug\nbuggy\nbugle\nbuilder\nbuilding\nbulb\nbulk\nbull\nbull-fighter\nbulldozer\nbullet\nbump\nbumper\nbun\nbunch\nbungalow\nbunghole\nbunkhouse\nburden\nbureau\nburglar\nburial\nburlesque\nburn\nburn-out\nburning\nburrito\nburro\nburrow\nburst\nbus\nbush\nbusiness\nbusinessman\nbust\nbustle\nbutane\nbutcher\nbutler\nbutter\nbutterfly\nbutton\nbuy\nbuyer\nbuying\nbuzz\nbuzzard\nc-clamp\ncabana\ncabbage\ncabin\ncabinet\ncable\ncaboose\ncacao\ncactus\ncaddy\ncadet\ncafe\ncaffeine\ncaftan\ncage\ncake\ncalcification\ncalculation\ncalculator\ncalculus\ncalendar\ncalf\ncaliber\ncalibre\ncalico\ncall\ncalm\ncalorie\ncamel\ncameo\ncamera\ncamp\ncampaign\ncampaigning\ncampanile\ncamper\ncampus\ncan\ncanal\ncancer\ncandelabra\ncandidacy\ncandidate\ncandle\ncandy\ncane\ncannibal\ncannon\ncanoe\ncanon\ncanopy\ncantaloupe\ncanteen\ncanvas\ncap\ncapability\ncapacity\ncape\ncaper\ncapital\ncapitalism\ncapitulation\ncapon\ncappelletti\ncappuccino\ncaptain\ncaption\ncaptor\ncar\ncarabao\ncaramel\ncaravan\ncarbohydrate\ncarbon\ncarboxyl\ncard\ncardboard\ncardigan\ncare\ncareer\ncargo\ncaribou\ncarload\ncarnation\ncarnival\ncarol\ncarotene\ncarp\ncarpenter\ncarpet\ncarpeting\ncarport\ncarriage\ncarrier\ncarrot\ncarry\ncart\ncartel\ncarter\ncartilage\ncartload\ncartoon\ncartridge\ncarving\ncascade\ncase\ncasement\ncash\ncashew\ncashier\ncasino\ncasket\ncassava\ncasserole\ncassock\ncast\ncastanet\ncastle\ncasualty\ncat\ncatacomb\ncatalogue\ncatalysis\ncatalyst\ncatamaran\ncatastrophe\ncatch\ncatcher\ncategory\ncaterpillar\ncathedral\ncation\ncatsup\ncattle\ncauliflower\ncausal\ncause\ncauseway\ncaution\ncave\ncaviar\ncayenne\nceiling\ncelebration\ncelebrity\nceleriac\ncelery\ncell\ncellar\ncello\ncelsius\ncement\ncemetery\ncenotaph\ncensus\ncent\ncenter\ncentimeter\ncentre\ncenturion\ncentury\ncephalopod\nceramic\nceramics\ncereal\nceremony\ncertainty\ncertificate\ncertification\ncesspool\nchafe\nchain\nchainstay\nchair\nchairlift\nchairman\nchairperson\nchaise\nchalet\nchalice\nchalk\nchallenge\nchamber\nchampagne\nchampion\nchampionship\nchance\nchandelier\nchange\nchannel\nchaos\nchap\nchapel\nchaplain\nchapter\ncharacter\ncharacteristic\ncharacterization\nchard\ncharge\ncharger\ncharity\ncharlatan\ncharm\ncharset\nchart\ncharter\nchasm\nchassis\nchastity\nchasuble\nchateau\nchatter\nchauffeur\nchauvinist\ncheck\ncheckbook\nchecking\ncheckout\ncheckroom\ncheddar\ncheek\ncheer\ncheese\ncheesecake\ncheetah\nchef\nchem\nchemical\nchemistry\nchemotaxis\ncheque\ncherry\nchess\nchest\nchestnut\nchick\nchicken\nchicory\nchief\nchiffonier\nchild\nchildbirth\nchildhood\nchili\nchill\nchime\nchimpanzee\nchin\nchinchilla\nchino\nchip\nchipmunk\nchit-chat\nchivalry\nchive\nchives\nchocolate\nchoice\nchoir\nchoker\ncholesterol\nchoosing\nchop\nchops\nchopstick\nchopsticks\nchord\nchorus\nchow\nchowder\nchrome\nchromolithograph\nchronicle\nchronograph\nchronometer\nchrysalis\nchub\nchuck\nchug\nchurch\nchurn\nchutney\ncicada\ncigarette\ncilantro\ncinder\ncinema\ncinnamon\ncircadian\ncircle\ncircuit\ncirculation\ncircumference\ncircumstance\ncirrhosis\ncirrus\ncitizen\ncitizenship\ncitron\ncitrus\ncity\ncivilian\ncivilisation\ncivilization\nclaim\nclam\nclamp\nclan\nclank\nclapboard\nclarification\nclarinet\nclarity\nclasp\nclass\nclassic\nclassification\nclassmate\nclassroom\nclause\nclave\nclavicle\nclavier\nclaw\nclay\ncleaner\nclearance\nclearing\ncleat\ncleavage\nclef\ncleft\nclergyman\ncleric\nclerk\nclick\nclient\ncliff\nclimate\nclimb\nclinic\nclip\nclipboard\nclipper\ncloak\ncloakroom\nclock\nclockwork\nclogs\ncloister\nclone\nclose\ncloset\nclosing\nclosure\ncloth\nclothes\nclothing\ncloud\ncloudburst\nclove\nclover\ncloves\nclub\nclue\ncluster\nclutch\nco-producer\ncoach\ncoal\ncoalition\ncoast\ncoaster\ncoat\ncob\ncobbler\ncobweb\ncock\ncockpit\ncockroach\ncocktail\ncocoa\ncoconut\ncod\ncode\ncodepage\ncodling\ncodon\ncodpiece\ncoevolution\ncofactor\ncoffee\ncoffin\ncohesion\ncohort\ncoil\ncoin\ncoincidence\ncoinsurance\ncoke\ncold\ncoleslaw\ncoliseum\ncollaboration\ncollagen\ncollapse\ncollar\ncollard\ncollateral\ncolleague\ncollection\ncollectivisation\ncollectivization\ncollector\ncollege\ncollision\ncolloquy\ncolon\ncolonial\ncolonialism\ncolonisation\ncolonization\ncolony\ncolor\ncolorlessness\ncolt\ncolumn\ncolumnist\ncomb\ncombat\ncombination\ncombine\ncomeback\ncomedy\ncomestible\ncomfort\ncomfortable\ncomic\ncomics\ncomma\ncommand\ncommander\ncommandment\ncomment\ncommerce\ncommercial\ncommission\ncommitment\ncommittee\ncommodity\ncommon\ncommonsense\ncommotion\ncommunicant\ncommunication\ncommunion\ncommunist\ncommunity\ncommuter\ncompany\ncomparison\ncompass\ncompassion\ncompassionate\ncompensation\ncompetence\ncompetition\ncompetitor\ncomplaint\ncomplement\ncompletion\ncomplex\ncomplexity\ncompliance\ncomplication\ncomplicity\ncompliment\ncomponent\ncomportment\ncomposer\ncomposite\ncomposition\ncompost\ncomprehension\ncompress\ncompromise\ncomptroller\ncompulsion\ncomputer\ncomradeship\ncon\nconcentrate\nconcentration\nconcept\nconception\nconcern\nconcert\nconclusion\nconcrete\ncondition\nconditioner\ncondominium\ncondor\nconduct\nconductor\ncone\nconfectionery\nconference\nconfidence\nconfidentiality\nconfiguration\nconfirmation\nconflict\nconformation\nconfusion\nconga\ncongo\ncongregation\ncongress\ncongressman\ncongressperson\nconifer\nconnection\nconnotation\nconscience\nconsciousness\nconsensus\nconsent\nconsequence\nconservation\nconservative\nconsideration\nconsignment\nconsist\nconsistency\nconsole\nconsonant\nconspiracy\nconspirator\nconstant\nconstellation\nconstitution\nconstraint\nconstruction\nconsul\nconsulate\nconsulting\nconsumer\nconsumption\ncontact\ncontact lens\ncontagion\ncontainer\ncontent\ncontention\ncontest\ncontext\ncontinent\ncontingency\ncontinuity\ncontour\ncontract\ncontractor\ncontrail\ncontrary\ncontrast\ncontribution\ncontributor\ncontrol\ncontroller\ncontroversy\nconvection\nconvenience\nconvention\nconversation\nconversion\nconvert\nconvertible\nconviction\ncook\ncookbook\ncookie\ncooking\ncoonskin\ncooperation\ncoordination\ncoordinator\ncop\ncop-out\ncope\ncopper\ncopy\ncopying\ncopyright\ncopywriter\ncoral\ncord\ncorduroy\ncore\ncork\ncormorant\ncorn\ncorner\ncornerstone\ncornet\ncornflakes\ncornmeal\ncorporal\ncorporation\ncorporatism\ncorps\ncorral\ncorrespondence\ncorrespondent\ncorridor\ncorruption\ncorsage\ncosset\ncost\ncostume\ncot\ncottage\ncotton\ncouch\ncougar\ncough\ncouncil\ncouncilman\ncouncilor\ncouncilperson\ncounsel\ncounseling\ncounselling\ncounsellor\ncounselor\ncount\ncounter\ncounter-force\ncounterpart\ncounterterrorism\ncountess\ncountry\ncountryside\ncounty\ncouple\ncoupon\ncourage\ncourse\ncourt\ncourthouse\ncourtroom\ncousin\ncovariate\ncover\ncoverage\ncoverall\ncow\ncowbell\ncowboy\ncoyote\ncrab\ncrack\ncracker\ncrackers\ncradle\ncraft\ncraftsman\ncranberry\ncrane\ncranky\ncrap\ncrash\ncrate\ncravat\ncraw\ncrawdad\ncrayfish\ncrayon\ncrazy\ncream\ncreation\ncreationism\ncreationist\ncreative\ncreativity\ncreator\ncreature\ncreche\ncredential\ncredenza\ncredibility\ncredit\ncreditor\ncreek\ncreme brulee\ncrepe\ncrest\ncrew\ncrewman\ncrewmate\ncrewmember\ncrewmen\ncria\ncrib\ncribbage\ncricket\ncricketer\ncrime\ncriminal\ncrinoline\ncrisis\ncrisp\ncriteria\ncriterion\ncritic\ncriticism\ncrocodile\ncrocus\ncroissant\ncrook\ncrop\ncross\ncross-contamination\ncross-stitch\ncrotch\ncroup\ncrow\ncrowd\ncrown\ncrucifixion\ncrude\ncruelty\ncruise\ncrumb\ncrunch\ncrusader\ncrush\ncrust\ncry\ncrystal\ncrystallography\ncub\ncube\ncuckoo\ncucumber\ncue\ncuff-link\ncuisine\ncultivar\ncultivator\nculture\nculvert\ncummerbund\ncup\ncupboard\ncupcake\ncupola\ncurd\ncure\ncurio\ncuriosity\ncurl\ncurler\ncurrant\ncurrency\ncurrent\ncurriculum\ncurry\ncurse\ncursor\ncurtailment\ncurtain\ncurve\ncushion\ncustard\ncustody\ncustom\ncustomer\ncut\ncuticle\ncutlet\ncutover\ncutting\ncyclamen\ncycle\ncyclone\ncyclooxygenase\ncygnet\ncylinder\ncymbal\ncynic\ncyst\ncytokine\ncytoplasm\ndad\ndaddy\ndaffodil\ndagger\ndahlia\ndaikon\ndaily\ndairy\ndaisy\ndam\ndamage\ndame\ndamn\ndance\ndancer\ndancing\ndandelion\ndanger\ndare\ndark\ndarkness\ndarn\ndart\ndash\ndashboard\ndata\ndatabase\ndate\ndaughter\ndawn\nday\ndaybed\ndaylight\ndead\ndeadline\ndeal\ndealer\ndealing\ndearest\ndeath\ndeathwatch\ndebate\ndebris\ndebt\ndebtor\ndecade\ndecadence\ndecency\ndecimal\ndecision\ndecision-making\ndeck\ndeclaration\ndeclination\ndecline\ndecoder\ndecongestant\ndecoration\ndecrease\ndecryption\ndedication\ndeduce\ndeduction\ndeed\ndeep\ndeer\ndefault\ndefeat\ndefendant\ndefender\ndefense\ndeficit\ndefinition\ndeformation\ndegradation\ndegree\ndelay\ndeliberation\ndelight\ndelivery\ndemand\ndemocracy\ndemocrat\ndemon\ndemur\nden\ndenim\ndenominator\ndensity\ndentist\ndeodorant\ndepartment\ndeparture\ndependency\ndependent\ndeployment\ndeposit\ndeposition\ndepot\ndepression\ndepressive\ndepth\ndeputy\nderby\nderivation\nderivative\nderrick\ndescendant\ndescent\ndescription\ndesert\ndesign\ndesignation\ndesigner\ndesire\ndesk\ndesktop\ndessert\ndestination\ndestiny\ndestroyer\ndestruction\ndetail\ndetainee\ndetainment\ndetection\ndetective\ndetector\ndetention\ndetermination\ndetour\ndevastation\ndeveloper\ndeveloping\ndevelopment\ndevelopmental\ndeviance\ndeviation\ndevice\ndevil\ndew\ndhow\ndiabetes\ndiadem\ndiagnosis\ndiagram\ndial\ndialect\ndialogue\ndiam\ndiamond\ndiaper\ndiaphragm\ndiarist\ndiary\ndibble\ndick\ndickey\ndictaphone\ndictator\ndiction\ndictionary\ndie\ndiesel\ndiet\ndifference\ndifferential\ndifficulty\ndiffuse\ndig\ndigestion\ndigestive\ndigger\ndigging\ndigit\ndignity\ndilapidation\ndill\ndilution\ndime\ndimension\ndimple\ndiner\ndinghy\ndining\ndinner\ndinosaur\ndioxide\ndip\ndiploma\ndiplomacy\ndipstick\ndirection\ndirective\ndirector\ndirectory\ndirndl\ndirt\ndisability\ndisadvantage\ndisagreement\ndisappointment\ndisarmament\ndisaster\ndischarge\ndiscipline\ndisclaimer\ndisclosure\ndisco\ndisconnection\ndiscount\ndiscourse\ndiscovery\ndiscrepancy\ndiscretion\ndiscrimination\ndiscussion\ndisdain\ndisease\ndisembodiment\ndisengagement\ndisguise\ndisgust\ndish\ndishwasher\ndisk\ndisparity\ndispatch\ndisplacement\ndisplay\ndisposal\ndisposer\ndisposition\ndispute\ndisregard\ndisruption\ndissemination\ndissonance\ndistance\ndistinction\ndistortion\ndistribution\ndistributor\ndistrict\ndivalent\ndivan\ndiver\ndiversity\ndivide\ndividend\ndivider\ndivine\ndiving\ndivision\ndivorce\ndoc\ndock\ndoctor\ndoctorate\ndoctrine\ndocument\ndocumentary\ndocumentation\ndoe\ndog\ndoggie\ndogsled\ndogwood\ndoing\ndoll\ndollar\ndollop\ndolman\ndolor\ndolphin\ndomain\ndome\ndomination\ndonation\ndonkey\ndonor\ndonut\ndoor\ndoorbell\ndoorknob\ndoorpost\ndoorway\ndory\ndose\ndot\ndouble\ndoubling\ndoubt\ndoubter\ndough\ndoughnut\ndown\ndownfall\ndownforce\ndowngrade\ndownload\ndownstairs\ndowntown\ndownturn\ndozen\ndraft\ndrag\ndragon\ndragonfly\ndragonfruit\ndragster\ndrain\ndrainage\ndrake\ndrama\ndramaturge\ndrapes\ndraw\ndrawbridge\ndrawer\ndrawing\ndream\ndreamer\ndredger\ndress\ndresser\ndressing\ndrill\ndrink\ndrinking\ndrive\ndriver\ndriveway\ndriving\ndrizzle\ndromedary\ndrop\ndrudgery\ndrug\ndrum\ndrummer\ndrunk\ndryer\nduck\nduckling\ndud\ndude\ndue\nduel\ndueling\nduffel\ndugout\ndulcimer\ndumbwaiter\ndump\ndump truck\ndune\ndune buggy\ndungarees\ndungeon\nduplexer\nduration\ndurian\ndusk\ndust\ndust storm\nduster\nduty\ndwarf\ndwell\ndwelling\ndynamics\ndynamite\ndynamo\ndynasty\ndysfunction\ne-book\ne-mail\ne-reader\neagle\neaglet\near\neardrum\nearmuffs\nearnings\nearplug\nearring\nearrings\nearth\nearthquake\nearthworm\nease\neasel\neast\neating\neaves\neavesdropper\necclesia\nechidna\neclipse\necliptic\necology\neconomics\neconomy\necosystem\nectoderm\nectodermal\necumenist\neddy\nedge\nedger\nedible\nediting\nedition\neditor\neditorial\neducation\neel\neffacement\neffect\neffective\neffectiveness\neffector\nefficacy\nefficiency\neffort\negg\negghead\neggnog\neggplant\nego\neicosanoid\nejector\nelbow\nelderberry\nelection\nelectricity\nelectrocardiogram\nelectronics\nelement\nelephant\nelevation\nelevator\neleventh\nelf\nelicit\neligibility\nelimination\nelite\nelixir\nelk\nellipse\nelm\nelongation\nelver\nemail\nemanate\nembarrassment\nembassy\nembellishment\nembossing\nembryo\nemerald\nemergence\nemergency\nemergent\nemery\nemission\nemitter\nemotion\nemphasis\nempire\nemploy\nemployee\nemployer\nemployment\nempowerment\nemu\nenactment\nencirclement\nenclave\nenclosure\nencounter\nencouragement\nencyclopedia\nend\nendive\nendoderm\nendorsement\nendothelium\nendpoint\nenemy\nenergy\nenforcement\nengagement\nengine\nengineer\nengineering\nenigma\nenjoyment\nenquiry\nenrollment\nenterprise\nentertainment\nenthusiasm\nentirety\nentity\nentrance\nentree\nentrepreneur\nentry\nenvelope\nenvironment\nenvy\nenzyme\nepauliere\nepee\nephemera\nephemeris\nephyra\nepic\nepisode\nepithelium\nepoch\neponym\nepoxy\nequal\nequality\nequation\nequinox\nequipment\nequity\nequivalent\nera\neraser\nerection\nerosion\nerror\nescalator\nescape\nescort\nespadrille\nespalier\nessay\nessence\nessential\nestablishment\nestate\nestimate\nestrogen\nestuary\neternity\nethernet\nethics\nethnicity\nethyl\neuphonium\neurocentrism\nevaluation\nevaluator\nevaporation\neve\nevening\nevening-wear\nevent\neverybody\neveryone\neverything\neviction\nevidence\nevil\nevocation\nevolution\nex-husband\nex-wife\nexaggeration\nexam\nexamination\nexaminer\nexample\nexasperation\nexcellence\nexception\nexcerpt\nexcess\nexchange\nexcitement\nexclamation\nexcursion\nexcuse\nexecution\nexecutive\nexecutor\nexercise\nexhaust\nexhaustion\nexhibit\nexhibition\nexile\nexistence\nexit\nexocrine\nexpansion\nexpansionism\nexpectancy\nexpectation\nexpedition\nexpense\nexperience\nexperiment\nexperimentation\nexpert\nexpertise\nexplanation\nexploration\nexplorer\nexplosion\nexport\nexpose\nexposition\nexposure\nexpression\nextension\nextent\nexterior\nexternal\nextinction\nextreme\nextremist\neye\neyeball\neyebrow\neyebrows\neyeglasses\neyelash\neyelashes\neyelid\neyelids\neyeliner\neyestrain\neyrie\nfabric\nface\nfacelift\nfacet\nfacility\nfacsimile\nfact\nfactor\nfactory\nfaculty\nfahrenheit\nfail\nfailure\nfairness\nfairy\nfaith\nfaithful\nfall\nfallacy\nfalling-out\nfame\nfamiliar\nfamiliarity\nfamily\nfan\nfang\nfanlight\nfanny\nfanny-pack\nfantasy\nfarm\nfarmer\nfarming\nfarmland\nfarrow\nfascia\nfashion\nfat\nfate\nfather\nfather-in-law\nfatigue\nfatigues\nfaucet\nfault\nfav\nfava\nfavor\nfavorite\nfawn\nfax\nfear\nfeast\nfeather\nfeature\nfedelini\nfederation\nfedora\nfee\nfeed\nfeedback\nfeeding\nfeel\nfeeling\nfellow\nfelony\nfemale\nfen\nfence\nfencing\nfender\nfeng\nfennel\nferret\nferry\nferryboat\nfertilizer\nfestival\nfetus\nfew\nfiber\nfiberglass\nfibre\nfibroblast\nfibrosis\nficlet\nfiction\nfiddle\nfield\nfiery\nfiesta\nfifth\nfig\nfight\nfighter\nfigure\nfigurine\nfile\nfiling\nfill\nfillet\nfilly\nfilm\nfilter\nfilth\nfinal\nfinance\nfinancing\nfinding\nfine\nfiner\nfinger\nfingerling\nfingernail\nfinish\nfinisher\nfir\nfire\nfireman\nfireplace\nfirewall\nfirm\nfirst\nfish\nfishbone\nfisherman\nfishery\nfishing\nfishmonger\nfishnet\nfisting\nfit\nfitness\nfix\nfixture\nflag\nflair\nflame\nflan\nflanker\nflare\nflash\nflat\nflatboat\nflavor\nflax\nfleck\nfledgling\nfleece\nflesh\nflexibility\nflick\nflicker\nflight\nflint\nflintlock\nflip-flops\nflock\nflood\nfloodplain\nfloor\nfloozie\nflour\nflow\nflower\nflu\nflugelhorn\nfluke\nflume\nflung\nflute\nfly\nflytrap\nfoal\nfoam\nfob\nfocus\nfog\nfold\nfolder\nfolk\nfolklore\nfollower\nfollowing\nfondue\nfont\nfood\nfoodstuffs\nfool\nfoot\nfootage\nfootball\nfootnote\nfootprint\nfootrest\nfootstep\nfootstool\nfootwear\nforage\nforager\nforay\nforce\nford\nforearm\nforebear\nforecast\nforehead\nforeigner\nforelimb\nforest\nforestry\nforever\nforgery\nfork\nform\nformal\nformamide\nformat\nformation\nformer\nformicarium\nformula\nfort\nforte\nfortnight\nfortress\nfortune\nforum\nfoundation\nfounder\nfounding\nfountain\nfourths\nfowl\nfox\nfoxglove\nfraction\nfragrance\nframe\nframework\nfratricide\nfraud\nfraudster\nfreak\nfreckle\nfreedom\nfreelance\nfreezer\nfreezing\nfreight\nfreighter\nfrenzy\nfreon\nfrequency\nfresco\nfriction\nfridge\nfriend\nfriendship\nfries\nfrigate\nfright\nfringe\nfritter\nfrock\nfrog\nfront\nfrontier\nfrost\nfrosting\nfrown\nfruit\nfrustration\nfry\nfuck\nfuel\nfugato\nfulfillment\nfull\nfun\nfunction\nfunctionality\nfund\nfunding\nfundraising\nfuneral\nfur\nfurnace\nfurniture\nfurry\nfusarium\nfuton\nfuture\ngadget\ngaffe\ngaffer\ngain\ngaiters\ngale\ngall-bladder\ngallery\ngalley\ngallon\ngaloshes\ngambling\ngame\ngamebird\ngaming\ngamma-ray\ngander\ngang\ngap\ngarage\ngarb\ngarbage\ngarden\ngarlic\ngarment\ngarter\ngas\ngasket\ngasoline\ngasp\ngastronomy\ngastropod\ngate\ngateway\ngather\ngathering\ngator\ngauge\ngauntlet\ngavel\ngazebo\ngazelle\ngear\ngearshift\ngeek\ngel\ngelatin\ngelding\ngem\ngemsbok\ngender\ngene\ngeneral\ngeneration\ngenerator\ngenerosity\ngenetics\ngenie\ngenius\ngenocide\ngenre\ngentleman\ngeography\ngeology\ngeometry\ngeranium\ngerbil\ngesture\ngeyser\ngherkin\nghost\ngiant\ngift\ngig\ngigantism\ngiggle\nginger\ngingerbread\nginseng\ngiraffe\ngirdle\ngirl\ngirlfriend\ngit\nglacier\ngladiolus\nglance\ngland\nglass\nglasses\nglee\nglen\nglider\ngliding\nglimpse\nglobe\nglockenspiel\ngloom\nglory\nglove\nglow\nglucose\nglue\nglut\nglutamate\ngnat\ngnu\ngo-kart\ngoal\ngoat\ngobbler\ngod\ngoddess\ngodfather\ngodmother\ngodparent\ngoggles\ngoing\ngold\ngoldfish\ngolf\ngondola\ngong\ngood\ngood-bye\ngoodbye\ngoodie\ngoodness\ngoodnight\ngoodwill\ngoose\ngopher\ngorilla\ngosling\ngossip\ngovernance\ngovernment\ngovernor\ngown\ngrab-bag\ngrace\ngrade\ngradient\ngraduate\ngraduation\ngraffiti\ngraft\ngrain\ngram\ngrammar\ngran\ngrand\ngrandchild\ngranddaughter\ngrandfather\ngrandma\ngrandmom\ngrandmother\ngrandpa\ngrandparent\ngrandson\ngranny\ngranola\ngrant\ngrape\ngrapefruit\ngraph\ngraphic\ngrasp\ngrass\ngrasshopper\ngrassland\ngratitude\ngravel\ngravitas\ngravity\ngravy\ngray\ngrease\ngreat-grandfather\ngreat-grandmother\ngreatness\ngreed\ngreen\ngreenhouse\ngreens\ngrenade\ngrey\ngrid\ngrief\ngrill\ngrin\ngrip\ngripper\ngrit\ngrocery\nground\ngroup\ngrouper\ngrouse\ngrove\ngrowth\ngrub\nguacamole\nguarantee\nguard\nguava\nguerrilla\nguess\nguest\nguestbook\nguidance\nguide\nguideline\nguilder\nguilt\nguilty\nguinea\nguitar\nguitarist\ngum\ngumshoe\ngun\ngunpowder\ngutter\nguy\ngym\ngymnast\ngymnastics\ngynaecology\ngyro\nhabit\nhabitat\nhacienda\nhacksaw\nhackwork\nhail\nhair\nhaircut\nhake\nhalf\nhalf-brother\nhalf-sister\nhalibut\nhall\nhalloween\nhallway\nhalt\nham\nhamburger\nhammer\nhammock\nhamster\nhand\nhand-holding\nhandball\nhandful\nhandgun\nhandicap\nhandle\nhandlebar\nhandmaiden\nhandover\nhandrail\nhandsaw\nhanger\nhappening\nhappiness\nharald\nharbor\nharbour\nhard-hat\nhardboard\nhardcover\nhardening\nhardhat\nhardship\nhardware\nhare\nharm\nharmonica\nharmonise\nharmonize\nharmony\nharp\nharpooner\nharpsichord\nharvest\nharvester\nhash\nhashtag\nhassock\nhaste\nhat\nhatbox\nhatchet\nhatchling\nhate\nhatred\nhaunt\nhaven\nhaversack\nhavoc\nhawk\nhay\nhaze\nhazel\nhazelnut\nhead\nheadache\nheadlight\nheadline\nheadphones\nheadquarters\nheadrest\nhealth\nhealth-care\nhearing\nhearsay\nheart\nheart-throb\nheartache\nheartbeat\nhearth\nhearthside\nheartwood\nheat\nheater\nheating\nheaven\nheavy\nhectare\nhedge\nhedgehog\nheel\nheifer\nheight\nheir\nheirloom\nhelicopter\nhelium\nhell\nhellcat\nhello\nhelmet\nhelo\nhelp\nhemisphere\nhemp\nhen\nhepatitis\nherb\nherbs\nheritage\nhermit\nhero\nheroine\nheron\nherring\nhesitation\nheterosexual\nhexagon\nheyday\nhiccups\nhide\nhierarchy\nhigh\nhigh-rise\nhighland\nhighlight\nhighway\nhike\nhiking\nhill\nhint\nhip\nhippodrome\nhippopotamus\nhire\nhiring\nhistorian\nhistory\nhit\nhive\nhobbit\nhobby\nhockey\nhoe\nhog\nhold\nholder\nhole\nholiday\nhome\nhomeland\nhomeownership\nhometown\nhomework\nhomicide\nhomogenate\nhomonym\nhomosexual\nhomosexuality\nhonesty\nhoney\nhoneybee\nhoneydew\nhonor\nhonoree\nhood\nhoof\nhook\nhop\nhope\nhops\nhorde\nhorizon\nhormone\nhorn\nhornet\nhorror\nhorse\nhorseradish\nhorst\nhose\nhosiery\nhospice\nhospital\nhospitalisation\nhospitality\nhospitalization\nhost\nhostel\nhostess\nhotdog\nhotel\nhound\nhour\nhourglass\nhouse\nhouseboat\nhousehold\nhousewife\nhousework\nhousing\nhovel\nhovercraft\nhoward\nhowitzer\nhub\nhubcap\nhubris\nhug\nhugger\nhull\nhuman\nhumanity\nhumidity\nhummus\nhumor\nhumour\nhunchback\nhundred\nhunger\nhunt\nhunter\nhunting\nhurdle\nhurdler\nhurricane\nhurry\nhurt\nhusband\nhut\nhutch\nhyacinth\nhybridisation\nhybridization\nhydrant\nhydraulics\nhydrocarb\nhydrocarbon\nhydrofoil\nhydrogen\nhydrolyse\nhydrolysis\nhydrolyze\nhydroxyl\nhyena\nhygienic\nhype\nhyphenation\nhypochondria\nhypothermia\nhypothesis\nice\nice-cream\niceberg\nicebreaker\nicecream\nicicle\nicing\nicon\nicy\nid\nidea\nideal\nidentification\nidentity\nideology\nidiom\nidiot\nigloo\nignorance\nignorant\nikebana\nillegal\nilliteracy\nillness\nillusion\nillustration\nimage\nimagination\nimbalance\nimitation\nimmigrant\nimmigration\nimmortal\nimpact\nimpairment\nimpala\nimpediment\nimplement\nimplementation\nimplication\nimport\nimportance\nimpostor\nimpress\nimpression\nimprisonment\nimpropriety\nimprovement\nimpudence\nimpulse\nin-joke\nin-laws\ninability\ninauguration\ninbox\nincandescence\nincarnation\nincense\nincentive\ninch\nincidence\nincident\nincision\ninclusion\nincome\nincompetence\ninconvenience\nincrease\nincubation\nindependence\nindependent\nindex\nindication\nindicator\nindigence\nindividual\nindustrialisation\nindustrialization\nindustry\ninequality\ninevitable\ninfancy\ninfant\ninfarction\ninfection\ninfiltration\ninfinite\ninfix\ninflammation\ninflation\ninfluence\ninflux\ninfo\ninformation\ninfrastructure\ninfusion\ninglenook\ningrate\ningredient\ninhabitant\ninheritance\ninhibition\ninhibitor\ninitial\ninitialise\ninitialize\ninitiative\ninjunction\ninjury\ninjustice\nink\ninlay\ninn\ninnervation\ninnocence\ninnocent\ninnovation\ninput\ninquiry\ninscription\ninsect\ninsectarium\ninsert\ninside\ninsight\ninsolence\ninsomnia\ninspection\ninspector\ninspiration\ninstallation\ninstance\ninstant\ninstinct\ninstitute\ninstitution\ninstruction\ninstructor\ninstrument\ninstrumentalist\ninstrumentation\ninsulation\ninsurance\ninsurgence\ninsurrection\ninteger\nintegral\nintegration\nintegrity\nintellect\nintelligence\nintensity\nintent\nintention\nintentionality\ninteraction\ninterchange\ninterconnection\nintercourse\ninterest\ninterface\ninterferometer\ninterior\ninterject\ninterloper\ninternet\ninterpretation\ninterpreter\ninterval\nintervenor\nintervention\ninterview\ninterviewer\nintestine\nintroduction\nintuition\ninvader\ninvasion\ninvention\ninventor\ninventory\ninverse\ninversion\ninvestigation\ninvestigator\ninvestment\ninvestor\ninvitation\ninvite\ninvoice\ninvolvement\niridescence\niris\niron\nironclad\nirony\nirrigation\nischemia\nisland\nisogloss\nisolation\nissue\nitem\nitinerary\nivory\njack\njackal\njacket\njackfruit\njade\njaguar\njail\njailhouse\njalape\xF1o\njam\njar\njasmine\njaw\njazz\njealousy\njeans\njeep\njelly\njellybeans\njellyfish\njerk\njet\njewel\njeweller\njewellery\njewelry\njicama\njiffy\njob\njockey\njodhpurs\njoey\njogging\njoint\njoke\njot\njournal\njournalism\njournalist\njourney\njoy\njudge\njudgment\njudo\njug\njuggernaut\njuice\njulienne\njumbo\njump\njumper\njumpsuit\njungle\njunior\njunk\njunker\njunket\njury\njustice\njustification\njute\nkale\nkamikaze\nkangaroo\nkarate\nkayak\nkazoo\nkebab\nkeep\nkeeper\nkendo\nkennel\nketch\nketchup\nkettle\nkettledrum\nkey\nkeyboard\nkeyboarding\nkeystone\nkick\nkick-off\nkid\nkidney\nkielbasa\nkill\nkiller\nkilling\nkilogram\nkilometer\nkilt\nkimono\nkinase\nkind\nkindness\nking\nkingdom\nkingfish\nkiosk\nkiss\nkit\nkitchen\nkite\nkitsch\nkitten\nkitty\nkiwi\nknee\nkneejerk\nknickers\nknife\nknife-edge\nknight\nknitting\nknock\nknot\nknow-how\nknowledge\nknuckle\nkoala\nkohlrabi\nkumquat\nlab\nlabel\nlabor\nlaboratory\nlaborer\nlabour\nlabourer\nlace\nlack\nlacquerware\nlad\nladder\nladle\nlady\nladybug\nlag\nlake\nlamb\nlambkin\nlament\nlamp\nlanai\nland\nlandform\nlanding\nlandmine\nlandscape\nlane\nlanguage\nlantern\nlap\nlaparoscope\nlapdog\nlaptop\nlarch\nlard\nlarder\nlark\nlarva\nlaryngitis\nlasagna\nlashes\nlast\nlatency\nlatex\nlathe\nlatitude\nlatte\nlatter\nlaugh\nlaughter\nlaundry\nlava\nlaw\nlawmaker\nlawn\nlawsuit\nlawyer\nlay\nlayer\nlayout\nlead\nleader\nleadership\nleading\nleaf\nleague\nleaker\nleap\nlearning\nleash\nleather\nleave\nleaver\nlecture\nleek\nleeway\nleft\nleg\nlegacy\nlegal\nlegend\nlegging\nlegislation\nlegislator\nlegislature\nlegitimacy\nlegume\nleisure\nlemon\nlemonade\nlemur\nlender\nlending\nlength\nlens\nlentil\nleopard\nleprosy\nleptocephalus\nlesbian\nlesson\nletter\nlettuce\nlevel\nlever\nleverage\nleveret\nliability\nliar\nliberty\nlibido\nlibrary\nlicence\nlicense\nlicensing\nlicorice\nlid\nlie\nlieu\nlieutenant\nlife\nlifestyle\nlifetime\nlift\nligand\nlight\nlighting\nlightning\nlightscreen\nligula\nlikelihood\nlikeness\nlilac\nlily\nlimb\nlime\nlimestone\nlimit\nlimitation\nlimo\nline\nlinen\nliner\nlinguist\nlinguistics\nlining\nlink\nlinkage\nlinseed\nlion\nlip\nlipid\nlipoprotein\nlipstick\nliquid\nliquidity\nliquor\nlist\nlistening\nlisting\nliterate\nliterature\nlitigation\nlitmus\nlitter\nlittleneck\nliver\nlivestock\nliving\nlizard\nllama\nload\nloading\nloaf\nloafer\nloan\nlobby\nlobotomy\nlobster\nlocal\nlocality\nlocation\nlock\nlocker\nlocket\nlocomotive\nlocust\nlode\nloft\nlog\nloggia\nlogic\nlogin\nlogistics\nlogo\nloincloth\nlollipop\nloneliness\nlongboat\nlongitude\nlook\nlookout\nloop\nloophole\nloquat\nlord\nloss\nlot\nlotion\nlottery\nlounge\nlouse\nlout\nlove\nlover\nlox\nloyalty\nluck\nluggage\nlumber\nlumberman\nlunch\nluncheonette\nlunchmeat\nlunchroom\nlung\nlunge\nlust\nlute\nluxury\nlychee\nlycra\nlye\nlymphocyte\nlynx\nlyocell\nlyre\nlyrics\nlysine\nmRNA\nmacadamia\nmacaroni\nmacaroon\nmacaw\nmachine\nmachinery\nmacrame\nmacro\nmacrofauna\nmadam\nmaelstrom\nmaestro\nmagazine\nmaggot\nmagic\nmagnet\nmagnitude\nmaid\nmaiden\nmail\nmailbox\nmailer\nmailing\nmailman\nmain\nmainland\nmainstream\nmaintainer\nmaintenance\nmaize\nmajor\nmajor-league\nmajority\nmakeover\nmaker\nmakeup\nmaking\nmale\nmalice\nmall\nmallard\nmallet\nmalnutrition\nmama\nmambo\nmammoth\nman\nmanacle\nmanagement\nmanager\nmanatee\nmandarin\nmandate\nmandolin\nmangle\nmango\nmangrove\nmanhunt\nmaniac\nmanicure\nmanifestation\nmanipulation\nmankind\nmanner\nmanor\nmansard\nmanservant\nmansion\nmantel\nmantle\nmantua\nmanufacturer\nmanufacturing\nmany\nmap\nmaple\nmapping\nmaracas\nmarathon\nmarble\nmarch\nmare\nmargarine\nmargin\nmariachi\nmarimba\nmarines\nmarionberry\nmark\nmarker\nmarket\nmarketer\nmarketing\nmarketplace\nmarksman\nmarkup\nmarmalade\nmarriage\nmarsh\nmarshland\nmarshmallow\nmarten\nmarxism\nmascara\nmask\nmasonry\nmass\nmassage\nmast\nmaster\nmasterpiece\nmastication\nmastoid\nmat\nmatch\nmatchmaker\nmate\nmaterial\nmaternity\nmath\nmathematics\nmatrix\nmatter\nmattock\nmattress\nmax\nmaximum\nmaybe\nmayonnaise\nmayor\nmeadow\nmeal\nmean\nmeander\nmeaning\nmeans\nmeantime\nmeasles\nmeasure\nmeasurement\nmeat\nmeatball\nmeatloaf\nmecca\nmechanic\nmechanism\nmed\nmedal\nmedia\nmedian\nmedication\nmedicine\nmedium\nmeet\nmeeting\nmelatonin\nmelody\nmelon\nmember\nmembership\nmembrane\nmeme\nmemo\nmemorial\nmemory\nmen\nmenopause\nmenorah\nmention\nmentor\nmenu\nmerchandise\nmerchant\nmercury\nmeridian\nmeringue\nmerit\nmesenchyme\nmess\nmessage\nmessenger\nmessy\nmetabolite\nmetal\nmetallurgist\nmetaphor\nmeteor\nmeteorology\nmeter\nmethane\nmethod\nmethodology\nmetric\nmetro\nmetronome\nmezzanine\nmicrolending\nmicronutrient\nmicrophone\nmicrowave\nmid-course\nmidden\nmiddle\nmiddleman\nmidline\nmidnight\nmidwife\nmight\nmigrant\nmigration\nmile\nmileage\nmilepost\nmilestone\nmilitary\nmilk\nmilkshake\nmill\nmillennium\nmillet\nmillimeter\nmillion\nmillisecond\nmillstone\nmime\nmimosa\nmin\nmincemeat\nmind\nmine\nmineral\nmineshaft\nmini\nmini-skirt\nminibus\nminimalism\nminimum\nmining\nminion\nminister\nmink\nminnow\nminor\nminor-league\nminority\nmint\nminute\nmiracle\nmirror\nmiscarriage\nmiscommunication\nmisfit\nmisnomer\nmisogyny\nmisplacement\nmisreading\nmisrepresentation\nmiss\nmissile\nmission\nmissionary\nmist\nmistake\nmister\nmisunderstand\nmiter\nmitten\nmix\nmixer\nmixture\nmoai\nmoat\nmob\nmobile\nmobility\nmobster\nmoccasins\nmocha\nmochi\nmode\nmodel\nmodeling\nmodem\nmodernist\nmodernity\nmodification\nmolar\nmolasses\nmolding\nmole\nmolecule\nmom\nmoment\nmonastery\nmonasticism\nmoney\nmonger\nmonitor\nmonitoring\nmonk\nmonkey\nmonocle\nmonopoly\nmonotheism\nmonsoon\nmonster\nmonth\nmonument\nmood\nmoody\nmoon\nmoonlight\nmoonscape\nmoonshine\nmoose\nmop\nmorale\nmorbid\nmorbidity\nmorning\nmoron\nmorphology\nmorsel\nmortal\nmortality\nmortgage\nmortise\nmosque\nmosquito\nmost\nmotel\nmoth\nmother\nmother-in-law\nmotion\nmotivation\nmotive\nmotor\nmotorboat\nmotorcar\nmotorcycle\nmound\nmountain\nmouse\nmouser\nmousse\nmoustache\nmouth\nmouton\nmovement\nmover\nmovie\nmower\nmozzarella\nmud\nmuffin\nmug\nmukluk\nmule\nmultimedia\nmurder\nmuscat\nmuscatel\nmuscle\nmusculature\nmuseum\nmushroom\nmusic\nmusic-box\nmusic-making\nmusician\nmuskrat\nmussel\nmustache\nmustard\nmutation\nmutt\nmutton\nmycoplasma\nmystery\nmyth\nmythology\nnail\nname\nnaming\nnanoparticle\nnapkin\nnarrative\nnasal\nnation\nnationality\nnative\nnaturalisation\nnature\nnavigation\nnecessity\nneck\nnecklace\nnecktie\nnectar\nnectarine\nneed\nneedle\nneglect\nnegligee\nnegotiation\nneighbor\nneighborhood\nneighbour\nneighbourhood\nneologism\nneon\nneonate\nnephew\nnerve\nnest\nnestling\nnestmate\nnet\nnetball\nnetbook\nnetsuke\nnetwork\nnetworking\nneurobiologist\nneuron\nneuropathologist\nneuropsychiatry\nnews\nnewsletter\nnewspaper\nnewsprint\nnewsstand\nnexus\nnibble\nnicety\nniche\nnick\nnickel\nnickname\nniece\nnight\nnightclub\nnightgown\nnightingale\nnightlife\nnightlight\nnightmare\nninja\nnit\nnitrogen\nnobody\nnod\nnode\nnoir\nnoise\nnonbeliever\nnonconformist\nnondisclosure\nnonsense\nnoodle\nnoodles\nnoon\nnorm\nnormal\nnormalisation\nnormalization\nnorth\nnose\nnotation\nnote\nnotebook\nnotepad\nnothing\nnotice\nnotion\nnotoriety\nnougat\nnoun\nnourishment\nnovel\nnucleotidase\nnucleotide\nnudge\nnuke\nnumber\nnumeracy\nnumeric\nnumismatist\nnun\nnurse\nnursery\nnursing\nnurture\nnut\nnutmeg\nnutrient\nnutrition\nnylon\nnymph\noak\noar\noasis\noat\noatmeal\noats\nobedience\nobesity\nobi\nobject\nobjection\nobjective\nobligation\noboe\nobservation\nobservatory\nobsession\nobsidian\nobstacle\noccasion\noccupation\noccurrence\nocean\nocelot\noctagon\noctave\noctavo\noctet\noctopus\nodometer\nodyssey\noeuvre\noff-ramp\noffence\noffense\noffer\noffering\noffice\nofficer\nofficial\noffset\noil\nokra\noldie\noleo\nolive\nomega\nomelet\nomission\nomnivore\noncology\nonion\nonline\nonset\nopening\nopera\noperating\noperation\noperator\nophthalmologist\nopinion\nopium\nopossum\nopponent\nopportunist\nopportunity\nopposite\nopposition\noptimal\noptimisation\noptimist\noptimization\noption\norange\norangutan\norator\norchard\norchestra\norchid\norder\nordinary\nordination\nore\noregano\norgan\norganisation\norganising\norganization\norganizing\norient\norientation\norigin\noriginal\noriginality\nornament\nosmosis\nosprey\nostrich\nother\notter\nottoman\nounce\noutback\noutcome\noutfielder\noutfit\nouthouse\noutlaw\noutlay\noutlet\noutline\noutlook\noutput\noutrage\noutrigger\noutrun\noutset\noutside\noval\novary\noven\novercharge\noverclocking\novercoat\noverexertion\noverflight\noverhead\noverheard\noverload\novernighter\novershoot\noversight\noverview\noverweight\nowl\nowner\nownership\nox\noxford\noxygen\noyster\nozone\npace\npacemaker\npack\npackage\npackaging\npacket\npad\npaddle\npaddock\npagan\npage\npagoda\npail\npain\npaint\npainter\npainting\npaintwork\npair\npajamas\npalace\npalate\npalm\npamphlet\npan\npancake\npancreas\npanda\npanel\npanic\npannier\npanpipe\npansy\npanther\npanties\npantologist\npantology\npantry\npants\npantsuit\npanty\npantyhose\npapa\npapaya\npaper\npaperback\npaperwork\nparable\nparachute\nparade\nparadise\nparagraph\nparallelogram\nparamecium\nparamedic\nparameter\nparanoia\nparcel\nparchment\npard\npardon\nparent\nparenthesis\nparenting\npark\nparka\nparking\nparliament\nparole\nparrot\nparser\nparsley\nparsnip\npart\nparticipant\nparticipation\nparticle\nparticular\npartner\npartnership\npartridge\nparty\npass\npassage\npassbook\npassenger\npassing\npassion\npassive\npassport\npassword\npast\npasta\npaste\npastor\npastoralist\npastry\npasture\npat\npatch\npate\npatent\npatentee\npath\npathogenesis\npathology\npathway\npatience\npatient\npatina\npatio\npatriarch\npatrimony\npatriot\npatrol\npatroller\npatrolling\npatron\npattern\npatty\npattypan\npause\npavement\npavilion\npaw\npawnshop\npay\npayee\npayment\npayoff\npea\npeace\npeach\npeacoat\npeacock\npeak\npeanut\npear\npearl\npeasant\npecan\npecker\npedal\npeek\npeen\npeer\npeer-to-peer\npegboard\npelican\npelt\npen\npenalty\npence\npencil\npendant\npendulum\npenguin\npenicillin\npeninsula\npenis\npennant\npenny\npension\npentagon\npeony\npeople\npepper\npepperoni\npercent\npercentage\nperception\nperch\nperennial\nperfection\nperformance\nperfume\nperiod\nperiodical\nperipheral\npermafrost\npermission\npermit\nperp\nperpendicular\npersimmon\nperson\npersonal\npersonality\npersonnel\nperspective\npest\npet\npetal\npetition\npetitioner\npetticoat\npew\npharmacist\npharmacopoeia\nphase\npheasant\nphenomenon\nphenotype\npheromone\nphilanthropy\nphilosopher\nphilosophy\nphone\nphosphate\nphoto\nphotodiode\nphotograph\nphotographer\nphotography\nphotoreceptor\nphrase\nphrasing\nphysical\nphysics\nphysiology\npianist\npiano\npiccolo\npick\npickax\npickaxe\npicket\npickle\npickup\npicnic\npicture\npicturesque\npie\npiece\npier\npiety\npig\npigeon\npiglet\npigpen\npigsty\npike\npilaf\npile\npilgrim\npilgrimage\npill\npillar\npillbox\npillow\npilot\npimp\npimple\npin\npinafore\npince-nez\npine\npineapple\npinecone\nping\npink\npinkie\npinot\npinstripe\npint\npinto\npinworm\npioneer\npipe\npipeline\npiracy\npirate\npiss\npistol\npit\npita\npitch\npitcher\npitching\npith\npizza\nplace\nplacebo\nplacement\nplacode\nplagiarism\nplain\nplaintiff\nplan\nplane\nplanet\nplanning\nplant\nplantation\nplanter\nplanula\nplaster\nplasterboard\nplastic\nplate\nplatelet\nplatform\nplatinum\nplatter\nplatypus\nplay\nplayer\nplayground\nplayroom\nplaywright\nplea\npleasure\npleat\npledge\nplenty\nplier\npliers\nplight\nplot\nplough\nplover\nplow\nplowman\nplug\nplugin\nplum\nplumber\nplume\nplunger\nplywood\npneumonia\npocket\npocket-watch\npocketbook\npod\npodcast\npoem\npoet\npoetry\npoignance\npoint\npoison\npoisoning\npoker\npolarisation\npolarization\npole\npolenta\npolice\npoliceman\npolicy\npolish\npolitician\npolitics\npoll\npolliwog\npollutant\npollution\npolo\npolyester\npolyp\npomegranate\npomelo\npompom\nponcho\npond\npony\npool\npoor\npop\npopcorn\npoppy\npopsicle\npopularity\npopulation\npopulist\nporcelain\nporch\nporcupine\npork\nporpoise\nport\nporter\nportfolio\nporthole\nportion\nportrait\nposition\npossession\npossibility\npossible\npost\npostage\npostbox\nposter\nposterior\npostfix\npot\npotato\npotential\npottery\npotty\npouch\npoultry\npound\npounding\npoverty\npowder\npower\npractice\npractitioner\nprairie\npraise\npray\nprayer\nprecedence\nprecedent\nprecipitation\nprecision\npredecessor\npreface\npreference\nprefix\npregnancy\nprejudice\nprelude\npremeditation\npremier\npremise\npremium\npreoccupation\npreparation\nprescription\npresence\npresent\npresentation\npreservation\npreserves\npresidency\npresident\npress\npressroom\npressure\npressurisation\npressurization\nprestige\npresume\npretzel\nprevalence\nprevention\nprey\nprice\npricing\npride\npriest\npriesthood\nprimary\nprimate\nprince\nprincess\nprincipal\nprinciple\nprint\nprinter\nprinting\nprior\npriority\nprison\nprisoner\nprivacy\nprivate\nprivilege\nprize\nprizefight\nprobability\nprobation\nprobe\nproblem\nprocedure\nproceedings\nprocess\nprocessing\nprocessor\nproctor\nprocurement\nproduce\nproducer\nproduct\nproduction\nproductivity\nprofession\nprofessional\nprofessor\nprofile\nprofit\nprogenitor\nprogram\nprogramme\nprogramming\nprogress\nprogression\nprohibition\nproject\nproliferation\npromenade\npromise\npromotion\nprompt\npronoun\npronunciation\nproof\nproof-reader\npropaganda\npropane\nproperty\nprophet\nproponent\nproportion\nproposal\nproposition\nproprietor\nprose\nprosecution\nprosecutor\nprospect\nprosperity\nprostacyclin\nprostanoid\nprostrate\nprotection\nprotein\nprotest\nprotocol\nprovidence\nprovider\nprovince\nprovision\nprow\nproximal\nproximity\nprune\npruner\npseudocode\npseudoscience\npsychiatrist\npsychoanalyst\npsychologist\npsychology\nptarmigan\npub\npublic\npublication\npublicity\npublisher\npublishing\npudding\npuddle\npuffin\npug\npuggle\npulley\npulse\npuma\npump\npumpernickel\npumpkin\npumpkinseed\npun\npunch\npunctuation\npunishment\npup\npupa\npupil\npuppet\npuppy\npurchase\npuritan\npurity\npurple\npurpose\npurr\npurse\npursuit\npush\npusher\nput\npuzzle\npyramid\npyridine\nquadrant\nquail\nqualification\nquality\nquantity\nquart\nquarter\nquartet\nquartz\nqueen\nquery\nquest\nquestion\nquestioner\nquestionnaire\nquiche\nquicksand\nquiet\nquill\nquilt\nquince\nquinoa\nquit\nquiver\nquota\nquotation\nquote\nrabbi\nrabbit\nraccoon\nrace\nracer\nracing\nracism\nracist\nrack\nradar\nradiator\nradio\nradiosonde\nradish\nraffle\nraft\nrag\nrage\nraid\nrail\nrailing\nrailroad\nrailway\nraiment\nrain\nrainbow\nraincoat\nrainmaker\nrainstorm\nrainy\nraise\nraisin\nrake\nrally\nram\nrambler\nramen\nramie\nranch\nrancher\nrandomisation\nrandomization\nrange\nranger\nrank\nrap\nrape\nraspberry\nrat\nrate\nratepayer\nrating\nratio\nrationale\nrations\nraven\nravioli\nrawhide\nray\nrayon\nrazor\nreach\nreactant\nreaction\nread\nreader\nreadiness\nreading\nreal\nreality\nrealization\nrealm\nreamer\nrear\nreason\nreasoning\nrebel\nrebellion\nreboot\nrecall\nrecapitulation\nreceipt\nreceiver\nreception\nreceptor\nrecess\nrecession\nrecipe\nrecipient\nreciprocity\nreclamation\nrecliner\nrecognition\nrecollection\nrecommendation\nreconsideration\nrecord\nrecorder\nrecording\nrecovery\nrecreation\nrecruit\nrectangle\nred\nredesign\nredhead\nredirect\nrediscovery\nreduction\nreef\nrefectory\nreference\nreferendum\nreflection\nreform\nrefreshments\nrefrigerator\nrefuge\nrefund\nrefusal\nrefuse\nregard\nregime\nregion\nregionalism\nregister\nregistration\nregistry\nregret\nregulation\nregulator\nrehospitalisation\nrehospitalization\nreindeer\nreinscription\nreject\nrelation\nrelationship\nrelative\nrelaxation\nrelay\nrelease\nreliability\nrelief\nreligion\nrelish\nreluctance\nremains\nremark\nreminder\nremnant\nremote\nremoval\nrenaissance\nrent\nreorganisation\nreorganization\nrepair\nreparation\nrepayment\nrepeat\nreplacement\nreplica\nreplication\nreply\nreport\nreporter\nreporting\nrepository\nrepresentation\nrepresentative\nreprocessing\nrepublic\nrepublican\nreputation\nrequest\nrequirement\nresale\nrescue\nresearch\nresearcher\nresemblance\nreservation\nreserve\nreservoir\nreset\nresidence\nresident\nresidue\nresist\nresistance\nresolution\nresolve\nresort\nresource\nrespect\nrespite\nresponse\nresponsibility\nrest\nrestaurant\nrestoration\nrestriction\nrestroom\nrestructuring\nresult\nresume\nretailer\nretention\nrethinking\nretina\nretirement\nretouching\nretreat\nretrospect\nretrospective\nretrospectivity\nreturn\nreunion\nrevascularisation\nrevascularization\nreveal\nrevelation\nrevenant\nrevenge\nrevenue\nreversal\nreverse\nreview\nrevitalisation\nrevitalization\nrevival\nrevolution\nrevolver\nreward\nrhetoric\nrheumatism\nrhinoceros\nrhubarb\nrhyme\nrhythm\nrib\nribbon\nrice\nriddle\nride\nrider\nridge\nriding\nrifle\nright\nrim\nring\nringworm\nriot\nrip\nripple\nrise\nriser\nrisk\nrite\nritual\nriver\nriverbed\nrivulet\nroad\nroadway\nroar\nroast\nrobe\nrobin\nrobot\nrobotics\nrock\nrocker\nrocket\nrocket-ship\nrod\nrole\nroll\nroller\nromaine\nromance\nroof\nroom\nroommate\nrooster\nroot\nrope\nrose\nrosemary\nroster\nrostrum\nrotation\nround\nroundabout\nroute\nrouter\nroutine\nrow\nrowboat\nrowing\nrubber\nrubbish\nrubric\nruby\nruckus\nrudiment\nruffle\nrug\nrugby\nruin\nrule\nruler\nruling\nrum\nrumor\nrun\nrunaway\nrunner\nrunning\nrunway\nrush\nrust\nrutabaga\nrye\nsabre\nsac\nsack\nsaddle\nsadness\nsafari\nsafe\nsafeguard\nsafety\nsaffron\nsage\nsail\nsailboat\nsailing\nsailor\nsaint\nsake\nsalad\nsalami\nsalary\nsale\nsalesman\nsalmon\nsalon\nsaloon\nsalsa\nsalt\nsalute\nsamovar\nsampan\nsample\nsamurai\nsanction\nsanctity\nsanctuary\nsand\nsandal\nsandbar\nsandpaper\nsandwich\nsanity\nsardine\nsari\nsarong\nsash\nsatellite\nsatin\nsatire\nsatisfaction\nsauce\nsaucer\nsauerkraut\nsausage\nsavage\nsavannah\nsaving\nsavings\nsavior\nsaviour\nsavory\nsaw\nsaxophone\nscaffold\nscale\nscallion\nscallops\nscalp\nscam\nscanner\nscarecrow\nscarf\nscarification\nscenario\nscene\nscenery\nscent\nschedule\nscheduling\nschema\nscheme\nschizophrenic\nschnitzel\nscholar\nscholarship\nschool\nschoolhouse\nschooner\nscience\nscientist\nscimitar\nscissors\nscooter\nscope\nscore\nscorn\nscorpion\nscotch\nscout\nscow\nscrambled\nscrap\nscraper\nscratch\nscreamer\nscreen\nscreening\nscreenwriting\nscrew\nscrew-up\nscrewdriver\nscrim\nscrip\nscript\nscripture\nscrutiny\nsculpting\nsculptural\nsculpture\nsea\nseabass\nseafood\nseagull\nseal\nseaplane\nsearch\nseashore\nseaside\nseason\nseat\nseaweed\nsecond\nsecrecy\nsecret\nsecretariat\nsecretary\nsecretion\nsection\nsectional\nsector\nsecurity\nsediment\nseed\nseeder\nseeker\nseep\nsegment\nseizure\nselection\nself\nself-confidence\nself-control\nself-esteem\nseller\nselling\nsemantics\nsemester\nsemicircle\nsemicolon\nsemiconductor\nseminar\nsenate\nsenator\nsender\nsenior\nsense\nsensibility\nsensitive\nsensitivity\nsensor\nsentence\nsentencing\nsentiment\nsepal\nseparation\nsepticaemia\nsequel\nsequence\nserial\nseries\nsermon\nserum\nserval\nservant\nserver\nservice\nservitude\nsesame\nsession\nset\nsetback\nsetting\nsettlement\nsettler\nseverity\nsewer\nsex\nsexuality\nshack\nshackle\nshade\nshadow\nshadowbox\nshakedown\nshaker\nshallot\nshallows\nshame\nshampoo\nshanty\nshape\nshare\nshareholder\nshark\nshaw\nshawl\nshear\nshearling\nsheath\nshed\nsheep\nsheet\nshelf\nshell\nshelter\nsherbet\nsherry\nshield\nshift\nshin\nshine\nshingle\nship\nshipper\nshipping\nshipyard\nshirt\nshirtdress\nshit\nshoat\nshock\nshoe\nshoe-horn\nshoehorn\nshoelace\nshoemaker\nshoes\nshoestring\nshofar\nshoot\nshootdown\nshop\nshopper\nshopping\nshore\nshoreline\nshort\nshortage\nshorts\nshortwave\nshot\nshoulder\nshout\nshovel\nshow\nshow-stopper\nshower\nshred\nshrimp\nshrine\nshutdown\nsibling\nsick\nsickness\nside\nsideboard\nsideburns\nsidecar\nsidestream\nsidewalk\nsiding\nsiege\nsigh\nsight\nsightseeing\nsign\nsignal\nsignature\nsignet\nsignificance\nsignify\nsignup\nsilence\nsilica\nsilicon\nsilk\nsilkworm\nsill\nsilly\nsilo\nsilver\nsimilarity\nsimple\nsimplicity\nsimplification\nsimvastatin\nsin\nsinger\nsinging\nsingular\nsink\nsinuosity\nsip\nsir\nsister\nsister-in-law\nsitar\nsite\nsituation\nsize\nskate\nskating\nskean\nskeleton\nski\nskiing\nskill\nskin\nskirt\nskull\nskullcap\nskullduggery\nskunk\nsky\nskylight\nskyline\nskyscraper\nskywalk\nslang\nslapstick\nslash\nslate\nslave\nslavery\nslaw\nsled\nsledge\nsleep\nsleepiness\nsleeping\nsleet\nsleuth\nslice\nslide\nslider\nslime\nslip\nslipper\nslippers\nslope\nslot\nsloth\nslump\nsmell\nsmelting\nsmile\nsmith\nsmock\nsmog\nsmoke\nsmoking\nsmolt\nsmuggling\nsnack\nsnail\nsnake\nsnakebite\nsnap\nsnarl\nsneaker\nsneakers\nsneeze\nsniffle\nsnob\nsnorer\nsnow\nsnowboarding\nsnowflake\nsnowman\nsnowmobiling\nsnowplow\nsnowstorm\nsnowsuit\nsnuck\nsnug\nsnuggle\nsoap\nsoccer\nsocialism\nsocialist\nsociety\nsociology\nsock\nsocks\nsoda\nsofa\nsoftball\nsoftdrink\nsoftening\nsoftware\nsoil\nsoldier\nsole\nsolicitation\nsolicitor\nsolidarity\nsolidity\nsoliloquy\nsolitaire\nsolution\nsolvency\nsombrero\nsomebody\nsomeone\nsomeplace\nsomersault\nsomething\nsomewhere\nson\nsonar\nsonata\nsong\nsongbird\nsonnet\nsoot\nsophomore\nsoprano\nsorbet\nsorghum\nsorrel\nsorrow\nsort\nsoul\nsoulmate\nsound\nsoundness\nsoup\nsource\nsourwood\nsousaphone\nsouth\nsoutheast\nsouvenir\nsovereignty\nsow\nsoy\nsoybean\nspace\nspacing\nspade\nspaghetti\nspan\nspandex\nspank\nsparerib\nspark\nsparrow\nspasm\nspat\nspatula\nspawn\nspeaker\nspeakerphone\nspeaking\nspear\nspec\nspecial\nspecialist\nspecialty\nspecies\nspecification\nspectacle\nspectacles\nspectrograph\nspectrum\nspeculation\nspeech\nspeed\nspeedboat\nspell\nspelling\nspelt\nspending\nsphere\nsphynx\nspice\nspider\nspiderling\nspike\nspill\nspinach\nspine\nspiral\nspirit\nspiritual\nspirituality\nspit\nspite\nspleen\nsplendor\nsplit\nspokesman\nspokeswoman\nsponge\nsponsor\nsponsorship\nspool\nspoon\nspork\nsport\nsportsman\nspot\nspotlight\nspouse\nsprag\nsprat\nspray\nspread\nspreadsheet\nspree\nspring\nsprinkles\nsprinter\nsprout\nspruce\nspud\nspume\nspur\nspy\nspyglass\nsquare\nsquash\nsquatter\nsqueegee\nsquid\nsquirrel\nstab\nstability\nstable\nstack\nstacking\nstadium\nstaff\nstag\nstage\nstain\nstair\nstaircase\nstake\nstalk\nstall\nstallion\nstamen\nstamina\nstamp\nstance\nstand\nstandard\nstandardisation\nstandardization\nstanding\nstandoff\nstandpoint\nstar\nstarboard\nstart\nstarter\nstate\nstatement\nstatin\nstation\nstation-wagon\nstatistic\nstatistics\nstatue\nstatus\nstatute\nstay\nsteak\nstealth\nsteam\nsteamroller\nsteel\nsteeple\nstem\nstench\nstencil\nstep\nstep-aunt\nstep-brother\nstep-daughter\nstep-father\nstep-grandfather\nstep-grandmother\nstep-mother\nstep-sister\nstep-son\nstep-uncle\nstepdaughter\nstepmother\nstepping-stone\nstepson\nstereo\nstew\nsteward\nstick\nsticker\nstiletto\nstill\nstimulation\nstimulus\nsting\nstinger\nstir-fry\nstitch\nstitcher\nstock\nstock-in-trade\nstockings\nstole\nstomach\nstone\nstonework\nstool\nstop\nstopsign\nstopwatch\nstorage\nstore\nstorey\nstorm\nstory\nstory-telling\nstoryboard\nstot\nstove\nstrait\nstrand\nstranger\nstrap\nstrategy\nstraw\nstrawberry\nstrawman\nstream\nstreet\nstreetcar\nstrength\nstress\nstretch\nstrife\nstrike\nstring\nstrip\nstripe\nstrobe\nstroke\nstructure\nstrudel\nstruggle\nstucco\nstud\nstudent\nstudio\nstudy\nstuff\nstumbling\nstump\nstupidity\nsturgeon\nsty\nstyle\nstyling\nstylus\nsub\nsubcomponent\nsubconscious\nsubcontractor\nsubexpression\nsubgroup\nsubject\nsubmarine\nsubmitter\nsubprime\nsubroutine\nsubscription\nsubsection\nsubset\nsubsidence\nsubsidiary\nsubsidy\nsubstance\nsubstitution\nsubtitle\nsuburb\nsubway\nsuccess\nsuccotash\nsuck\nsucker\nsuede\nsuet\nsuffocation\nsugar\nsuggestion\nsuicide\nsuit\nsuitcase\nsuite\nsulfur\nsultan\nsum\nsummary\nsummer\nsummit\nsun\nsunbeam\nsunbonnet\nsundae\nsunday\nsundial\nsunflower\nsunglasses\nsunlamp\nsunlight\nsunrise\nsunroom\nsunset\nsunshine\nsuperiority\nsupermarket\nsupernatural\nsupervision\nsupervisor\nsupper\nsupplement\nsupplier\nsupply\nsupport\nsupporter\nsuppression\nsupreme\nsurface\nsurfboard\nsurge\nsurgeon\nsurgery\nsurname\nsurplus\nsurprise\nsurround\nsurroundings\nsurrounds\nsurvey\nsurvival\nsurvivor\nsushi\nsuspect\nsuspenders\nsuspension\nsustainment\nsustenance\nswallow\nswamp\nswan\nswanling\nswath\nsweat\nsweater\nsweatshirt\nsweatshop\nsweatsuit\nsweets\nswell\nswim\nswimming\nswimsuit\nswine\nswing\nswitch\nswitchboard\nswitching\nswivel\nsword\nswordfight\nswordfish\nsycamore\nsymbol\nsymmetry\nsympathy\nsymptom\nsyndicate\nsyndrome\nsynergy\nsynod\nsynonym\nsynthesis\nsyrup\nsystem\nt-shirt\ntab\ntabby\ntabernacle\ntable\ntablecloth\ntablet\ntabletop\ntachometer\ntackle\ntaco\ntactics\ntactile\ntadpole\ntag\ntail\ntailbud\ntailor\ntailspin\ntake-out\ntakeover\ntale\ntalent\ntalk\ntalking\ntam-o'-shanter\ntamale\ntambour\ntambourine\ntan\ntandem\ntangerine\ntank\ntank-top\ntanker\ntankful\ntap\ntape\ntapioca\ntarget\ntaro\ntarragon\ntart\ntask\ntassel\ntaste\ntatami\ntattler\ntattoo\ntavern\ntax\ntaxi\ntaxicab\ntaxpayer\ntea\nteacher\nteaching\nteam\nteammate\nteapot\ntear\ntech\ntechnician\ntechnique\ntechnologist\ntechnology\ntectonics\nteen\nteenager\nteepee\ntelephone\ntelescreen\nteletype\ntelevision\ntell\nteller\ntemp\ntemper\ntemperature\ntemple\ntempo\ntemporariness\ntemporary\ntemptation\ntemptress\ntenant\ntendency\ntender\ntenement\ntenet\ntennis\ntenor\ntension\ntensor\ntent\ntentacle\ntenth\ntepee\nteriyaki\nterm\nterminal\ntermination\nterminology\ntermite\nterrace\nterracotta\nterrapin\nterrarium\nterritory\nterror\nterrorism\nterrorist\ntest\ntestament\ntestimonial\ntestimony\ntesting\ntext\ntextbook\ntextual\ntexture\nthanks\nthaw\ntheater\ntheft\ntheism\ntheme\ntheology\ntheory\ntherapist\ntherapy\nthermals\nthermometer\nthermostat\nthesis\nthickness\nthief\nthigh\nthing\nthinking\nthirst\nthistle\nthong\nthongs\nthorn\nthought\nthousand\nthread\nthreat\nthreshold\nthrift\nthrill\nthroat\nthrone\nthrush\nthrust\nthug\nthumb\nthump\nthunder\nthunderbolt\nthunderhead\nthunderstorm\nthyme\ntiara\ntic\ntick\nticket\ntide\ntie\ntiger\ntights\ntile\ntill\ntilt\ntimbale\ntimber\ntime\ntimeline\ntimeout\ntimer\ntimetable\ntiming\ntimpani\ntin\ntinderbox\ntinkle\ntintype\ntip\ntire\ntissue\ntitanium\ntitle\ntoad\ntoast\ntoaster\ntobacco\ntoday\ntoe\ntoenail\ntoffee\ntofu\ntog\ntoga\ntoilet\ntolerance\ntolerant\ntoll\ntom-tom\ntomatillo\ntomato\ntomb\ntomography\ntomorrow\nton\ntonality\ntone\ntongue\ntonic\ntonight\ntool\ntoot\ntooth\ntoothbrush\ntoothpaste\ntoothpick\ntop\ntop-hat\ntopic\ntopsail\ntoque\ntoreador\ntornado\ntorso\ntorte\ntortellini\ntortilla\ntortoise\ntosser\ntotal\ntote\ntouch\ntough-guy\ntour\ntourism\ntourist\ntournament\ntow-truck\ntowel\ntower\ntown\ntownhouse\ntownship\ntoy\ntrace\ntrachoma\ntrack\ntracking\ntracksuit\ntract\ntractor\ntrade\ntrader\ntrading\ntradition\ntraditionalism\ntraffic\ntrafficker\ntragedy\ntrail\ntrailer\ntrailpatrol\ntrain\ntrainer\ntraining\ntrait\ntram\ntramp\ntrance\ntransaction\ntranscript\ntransfer\ntransformation\ntransit\ntransition\ntranslation\ntransmission\ntransom\ntransparency\ntransplantation\ntransport\ntransportation\ntrap\ntrapdoor\ntrapezium\ntrapezoid\ntrash\ntravel\ntraveler\ntray\ntreasure\ntreasury\ntreat\ntreatment\ntreaty\ntree\ntrek\ntrellis\ntremor\ntrench\ntrend\ntriad\ntrial\ntriangle\ntribe\ntributary\ntrick\ntrigger\ntrigonometry\ntrillion\ntrim\ntrinket\ntrip\ntripod\ntritone\ntriumph\ntrolley\ntrombone\ntroop\ntrooper\ntrophy\ntrouble\ntrousers\ntrout\ntrove\ntrowel\ntruck\ntrumpet\ntrunk\ntrust\ntrustee\ntruth\ntry\ntsunami\ntub\ntuba\ntube\ntuber\ntug\ntugboat\ntuition\ntulip\ntumbler\ntummy\ntuna\ntune\ntune-up\ntunic\ntunnel\nturban\nturf\nturkey\nturmeric\nturn\nturning\nturnip\nturnover\nturnstile\nturret\nturtle\ntusk\ntussle\ntutu\ntuxedo\ntweet\ntweezers\ntwig\ntwilight\ntwine\ntwins\ntwist\ntwister\ntwitter\ntype\ntypeface\ntypewriter\ntyphoon\nukulele\nultimatum\numbrella\nunblinking\nuncertainty\nuncle\nunderclothes\nunderestimate\nunderground\nunderneath\nunderpants\nunderpass\nundershirt\nunderstanding\nunderstatement\nundertaker\nunderwear\nunderweight\nunderwire\nunderwriting\nunemployment\nunibody\nuniform\nuniformity\nunion\nunique\nunit\nunity\nuniverse\nuniversity\nupdate\nupgrade\nuplift\nupper\nupstairs\nupward\nurge\nurgency\nurn\nusage\nuse\nuser\nusher\nusual\nutensil\nutilisation\nutility\nutilization\nvacation\nvaccine\nvacuum\nvagrant\nvalance\nvalentine\nvalidate\nvalidity\nvalley\nvaluable\nvalue\nvampire\nvan\nvanadyl\nvane\nvanilla\nvanity\nvariability\nvariable\nvariant\nvariation\nvariety\nvascular\nvase\nvault\nvaulting\nveal\nvector\nvegetable\nvegetarian\nvegetarianism\nvegetation\nvehicle\nveil\nvein\nveldt\nvellum\nvelocity\nvelodrome\nvelvet\nvendor\nveneer\nvengeance\nvenison\nvenom\nventi\nventure\nvenue\nveranda\nverb\nverdict\nverification\nvermicelli\nvernacular\nverse\nversion\nvertigo\nverve\nvessel\nvest\nvestment\nvet\nveteran\nveterinarian\nveto\nviability\nvibe\nvibraphone\nvibration\nvibrissae\nvice\nvicinity\nvictim\nvictory\nvideo\nview\nviewer\nvignette\nvilla\nvillage\nvine\nvinegar\nvineyard\nvintage\nvintner\nvinyl\nviola\nviolation\nviolence\nviolet\nviolin\nvirginal\nvirtue\nvirus\nvisa\nviscose\nvise\nvision\nvisit\nvisitor\nvisor\nvista\nvisual\nvitality\nvitamin\nvitro\nvivo\nvixen\nvodka\nvogue\nvoice\nvoid\nvol\nvolatility\nvolcano\nvolleyball\nvolume\nvolunteer\nvolunteering\nvomit\nvote\nvoter\nvoting\nvoyage\nvulture\nwad\nwafer\nwaffle\nwage\nwagon\nwaist\nwaistband\nwait\nwaiter\nwaiting\nwaitress\nwaiver\nwake\nwalk\nwalker\nwalking\nwalkway\nwall\nwallaby\nwallet\nwalnut\nwalrus\nwampum\nwannabe\nwant\nwar\nwarden\nwardrobe\nwarfare\nwarlock\nwarlord\nwarm-up\nwarming\nwarmth\nwarning\nwarrant\nwarren\nwarrior\nwasabi\nwash\nwashbasin\nwashcloth\nwasher\nwashtub\nwasp\nwaste\nwastebasket\nwasting\nwatch\nwatcher\nwatchmaker\nwater\nwaterbed\nwatercress\nwaterfall\nwaterfront\nwatermelon\nwaterskiing\nwaterspout\nwaterwheel\nwave\nwaveform\nwax\nway\nweakness\nwealth\nweapon\nwear\nweasel\nweather\nweb\nwebinar\nwebmail\nwebpage\nwebsite\nwedding\nwedge\nweed\nweeder\nweedkiller\nweek\nweekend\nweekender\nweight\nweird\nwelcome\nwelfare\nwell\nwell-being\nwest\nwestern\nwet-bar\nwetland\nwetsuit\nwhack\nwhale\nwharf\nwheat\nwheel\nwhelp\nwhey\nwhip\nwhirlpool\nwhirlwind\nwhisker\nwhiskey\nwhisper\nwhistle\nwhite\nwhole\nwholesale\nwholesaler\nwhorl\nwick\nwidget\nwidow\nwidth\nwife\nwifi\nwild\nwildebeest\nwilderness\nwildlife\nwill\nwillingness\nwillow\nwin\nwind\nwind-chime\nwindage\nwindow\nwindscreen\nwindshield\nwine\nwinery\nwing\nwingman\nwingtip\nwink\nwinner\nwinter\nwire\nwiretap\nwiring\nwisdom\nwiseguy\nwish\nwisteria\nwit\nwitch\nwitch-hunt\nwithdrawal\nwitness\nwok\nwolf\nwoman\nwombat\nwonder\nwont\nwood\nwoodchuck\nwoodland\nwoodshed\nwoodwind\nwool\nwoolens\nword\nwording\nwork\nworkbench\nworker\nworkforce\nworkhorse\nworking\nworkout\nworkplace\nworkshop\nworld\nworm\nworry\nworship\nworshiper\nworth\nwound\nwrap\nwraparound\nwrapper\nwrapping\nwreck\nwrecker\nwren\nwrench\nwrestler\nwriggler\nwrinkle\nwrist\nwriter\nwriting\nwrong\nxylophone\nyacht\nyahoo\nyak\nyam\nyang\nyard\nyarmulke\nyarn\nyawl\nyear\nyeast\nyellow\nyellowjacket\nyesterday\nyew\nyin\nyoga\nyogurt\nyoke\nyolk\nyoung\nyoungster\nyourself\nyouth\nyoyo\nyurt\nzampone\nzebra\nzebrafish\nzen\nzephyr\nzero\nziggurat\nzinc\nzipper\nzither\nzombie\nzone\nzoo\nzoologist\nzoology\nzoot-suit\nzucchini\n".split("\n").filter(Boolean);

var buildUpFanta = function buildUpFanta($guys) {
  var number = (0, _numberNames.default)(Math.round(999 * Math.random()));
  var inverted = Math.random() > 0.5;
  var words = [];

  _toConsumableArray($guys.querySelectorAll("x-guys-number")).forEach(function ($el) {
    $el.innerText = number;
  });

  $guys.querySelectorAll("x-guys-word").forEach(function ($el) {
    var w = (0, _pluralize.default)(randomArrKey(wordList));
    words.push(w);
    $el.innerText = w;
  });

  if (inverted) {
    document.body.dataset.inverted = "true";
  }

  var tweet = ["".concat(number, " guys").toUpperCase(), words.map(function (w) {
    return w.toUpperCase();
  }).join(" and ")].join("\n");
  return {
    number: number,
    words: words,
    tweet: tweet
  };
};

var go = function go() {
  var $guys = document.querySelector("x-guys");
  var data = buildUpFanta($guys, data);
  console.log(JSON.stringify(data));
};

go();
},{"fs":"../node_modules/parcel-bundler/src/builtins/_empty.js","pluralize":"../node_modules/pluralize/pluralize.js","number-names":"../node_modules/number-names/index.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "51390" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js.js"], null)
//# sourceMappingURL=/js.00934245.js.map