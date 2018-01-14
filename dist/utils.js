'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.warn = exports.toType = exports.withRequired = exports.withDefault = exports.validateType = exports.isFunction = exports.isArray = exports.isInteger = exports.has = exports.getNativeType = exports.getType = exports.hasOwn = undefined;

var _set = require('babel-runtime/core-js/reflect/set');

var _set2 = _interopRequireDefault(_set);

var _isInteger = require('babel-runtime/core-js/number/is-integer');

var _isInteger2 = _interopRequireDefault(_isInteger);

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

var _isNil = require('lodash/isNil');

var _isNil2 = _interopRequireDefault(_isNil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ObjProto = Object.prototype;
var $toString = ObjProto.toString;
var hasOwn = exports.hasOwn = ObjProto.hasOwnProperty;

var FN_MATCH_REGEXP = /^\s*function (\w+)/;

var getFnType = function getFnType(fn) {
  return fn.type ? fn.type : fn;
};

// https://github.com/vuejs/vue/blob/dev/src/core/util/props.js#L159
var getType = exports.getType = function getType(fn) {
  var type = (0, _isNil2.default)(fn) ? null : getFnType(fn);
  var match = type && type.toString().match(FN_MATCH_REGEXP);

  return match && match[1];
};

var getNativeType = exports.getNativeType = function getNativeType(value) {
  if ((0, _isNil2.default)(value)) {
    return null;
  }

  var match = value.constructor.toString().match(FN_MATCH_REGEXP);

  return match && match[1];
};

/**
 * Checks for a own property in an object.
 *
 * @param {Object} obj - Object.
 * @param {string} prop - Property to check.
 */
var has = exports.has = function has(obj, prop) {
  return hasOwn.call(obj, prop);
};

/**
 * Determines whether the passed value is an integer.
 * Uses `Number.isInteger` if available.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
 * @param {*} value - The value to be tested for being an integer.
 * @returns {boolean}
 */
var isInteger = exports.isInteger = _isInteger2.default || function isInteger(value) {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value; // eslint-disable-line no-restricted-globals
};

/**
 * Determines whether the passed value is an Array.
 *
 * @param {*} value - The value to be tested for being an array.
 * @returns {boolean}
 */
var isArray = exports.isArray = Array.isArray || function isArray(value) {
  return toString.call(value) === '[object Array]';
};

/**
 * Checks if a value is a function.
 *
 * @param {any} value - Value to check.
 * @returns {boolean}
 */
var isFunction = exports.isFunction = function isFunction(value) {
  return $toString.call(value) === '[object Function]';
};

var warn = function getWarn() {
  if (process.env.NODE_ENV === 'production' || typeof console === 'undefined') {
    return _noop2.default;
  }

  return function (msg) {
    return console.warn('[VueTypes warn]: ' + msg);
  }; // eslint-disable-line no-console
}();

/**
 * Validates a given value against a prop type object.
 *
 * @param {Object|*} type - Type to use for validation. Either a type object or a constructor.
 * @param {*} value - Value to check.
 * @param {boolean} silent - Silence warnings.
 * @returns {boolean}
 */
var validateType = exports.validateType = function validateType(type, value) {
  var silent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var typeToCheck = type;
  var valid = true;
  var expectedType = void 0;
  if (!(0, _isPlainObject2.default)(type)) {
    typeToCheck = {
      type: type
    };
  }

  var namePrefix = typeToCheck._vueTypes_name ? typeToCheck._vueTypes_name + ' - ' : '';

  if (hasOwn.call(typeToCheck, 'type') && typeToCheck.type !== null) {
    if (isArray(typeToCheck.type)) {
      valid = typeToCheck.type.some(function (T) {
        return validateType(T, value, true);
      });
      expectedType = typeToCheck.type.map(function (T) {
        return getType(T);
      }).join(' or ');
    } else {
      expectedType = getType(typeToCheck);

      if (expectedType === 'Array') {
        valid = isArray(value);
      } else if (expectedType === 'Object') {
        valid = (0, _isPlainObject2.default)(value);
      } else if (expectedType === 'String' || expectedType === 'Number' || expectedType === 'Boolean' || expectedType === 'Function') {
        valid = getNativeType(value) === expectedType;
      } else {
        valid = value instanceof typeToCheck.type;
      }
    }
  }

  if (!valid) {
    if (silent === false) {
      warn(namePrefix + 'value "' + value + '" should be of type "' + expectedType + '"');
    }

    return false;
  }

  if (hasOwn.call(typeToCheck, 'validator') && isFunction(typeToCheck.validator)) {
    valid = typeToCheck.validator(value);
    if (!valid && silent === false) {
      warn(namePrefix + 'custom validation failed');
    }

    return valid;
  }

  return valid;
};

/**
 * Adds a `def` method to the object returning a new object with passed in argument
 * as `default` property.
 *
 * @param {Object} type - Object to enhance.
 */
var withDefault = exports.withDefault = function withDefault(type) {
  Object.defineProperty(type, 'def', {
    value: function value(def) {
      if (def === undefined && !this.default) {
        return this;
      }

      if (!isFunction(def) && !validateType(this, def)) {
        warn(this._vueTypes_name + ' - invalid default value: "' + def + '"', def);

        return this;
      }

      this.default = isArray(def) || (0, _isPlainObject2.default)(def) ? function getDefault() {
        return def;
      } : def;

      return this;
    }
  });
};

/**
 * Adds a `isRequired` getter returning a new object with `required: true` key-value.
 *
 * @param {Object} type - Object to enhance.
 */
var withRequired = exports.withRequired = function withRequired(type) {
  Object.defineProperty(type, 'isRequired', {
    get: function get() {
      this.required = true;
      return this;
    }
  });
};

/**
 * Adds `isRequired` and `def` modifiers to an object.
 *
 * @param {string} name - Type internal name.
 * @param {Object} obj - Object to enhance.
 * @returns {Object}
 */
var toType = exports.toType = function toType(name, obj) {
  Object.defineProperty(obj, '_vueTypes_name', {
    value: name
  });

  withRequired(obj);
  withDefault(obj);

  if (isFunction(obj.validator)) {
    (0, _set2.default)(obj, 'validator', obj.validator.bind(obj));
  }

  return obj;
};

exports.warn = warn;