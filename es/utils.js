import _Reflect$set from 'babel-runtime/core-js/reflect/set';
import _Number$isInteger from 'babel-runtime/core-js/number/is-integer';
import _newArrowCheck from 'babel-runtime/helpers/newArrowCheck';

var _this = this;

import isPlainObject from 'lodash/isPlainObject';
import noop from 'lodash/noop';
import isNil from 'lodash/isNil';

var ObjProto = Object.prototype;
var $toString = ObjProto.toString;
export var hasOwn = ObjProto.hasOwnProperty;

var FN_MATCH_REGEXP = /^\s*function (\w+)/;

var getFnType = function (fn) {
  _newArrowCheck(this, _this);

  return fn.type ? fn.type : fn;
}.bind(this);

// https://github.com/vuejs/vue/blob/dev/src/core/util/props.js#L159
export var getType = function (fn) {
  _newArrowCheck(this, _this);

  var type = isNil(fn) ? null : getFnType(fn);
  var match = type && type.toString().match(FN_MATCH_REGEXP);

  return match && match[1];
}.bind(this);

export var getNativeType = function (value) {
  _newArrowCheck(this, _this);

  if (isNil(value)) {
    return null;
  }

  var match = value.constructor.toString().match(FN_MATCH_REGEXP);

  return match && match[1];
}.bind(this);

/**
 * Checks for a own property in an object.
 *
 * @param {Object} obj - Object.
 * @param {string} prop - Property to check.
 */
export var has = function (obj, prop) {
  _newArrowCheck(this, _this);

  return hasOwn.call(obj, prop);
}.bind(this);

/**
 * Determines whether the passed value is an integer.
 * Uses `Number.isInteger` if available.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
 * @param {*} value - The value to be tested for being an integer.
 * @returns {boolean}
 */
export var isInteger = _Number$isInteger || function isInteger(value) {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value; // eslint-disable-line no-restricted-globals
};

/**
 * Determines whether the passed value is an Array.
 *
 * @param {*} value - The value to be tested for being an array.
 * @returns {boolean}
 */
export var isArray = Array.isArray || function isArray(value) {
  return toString.call(value) === '[object Array]';
};

/**
 * Checks if a value is a function.
 *
 * @param {any} value - Value to check.
 * @returns {boolean}
 */
export var isFunction = function (value) {
  _newArrowCheck(this, _this);

  return $toString.call(value) === '[object Function]';
}.bind(this);

var warn = function getWarn() {
  var _this2 = this;

  if (process.env.NODE_ENV === 'production' || typeof console === 'undefined') {
    return noop;
  }

  return function (msg) {
    _newArrowCheck(this, _this2);

    return console.warn('[VueTypes warn]: ' + String(msg));
  }.bind(this); // eslint-disable-line no-console
}();

/**
 * Validates a given value against a prop type object.
 *
 * @param {Object|*} type - Type to use for validation. Either a type object or a constructor.
 * @param {*} value - Value to check.
 * @param {boolean} silent - Silence warnings.
 * @returns {boolean}
 */
export var validateType = function (type, value) {
  var silent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  _newArrowCheck(this, _this);

  var typeToCheck = type;
  var valid = true;
  var expectedType = void 0;
  if (!isPlainObject(type)) {
    typeToCheck = {
      type: type
    };
  }

  var namePrefix = typeToCheck._vueTypes_name ? String(typeToCheck._vueTypes_name) + ' - ' : '';

  if (hasOwn.call(typeToCheck, 'type') && typeToCheck.type !== null) {
    if (isArray(typeToCheck.type)) {
      valid = typeToCheck.type.some(function (T) {
        _newArrowCheck(this, _this);

        return validateType(T, value, true);
      }.bind(this));
      expectedType = typeToCheck.type.map(function (T) {
        _newArrowCheck(this, _this);

        return getType(T);
      }.bind(this)).join(' or ');
    } else {
      expectedType = getType(typeToCheck);

      if (expectedType === 'Array') {
        valid = isArray(value);
      } else if (expectedType === 'Object') {
        valid = isPlainObject(value);
      } else if (expectedType === 'String' || expectedType === 'Number' || expectedType === 'Boolean' || expectedType === 'Function') {
        valid = getNativeType(value) === expectedType;
      } else {
        valid = value instanceof typeToCheck.type;
      }
    }
  }

  if (!valid) {
    if (silent === false) {
      warn(namePrefix + 'value "' + String(value) + '" should be of type "' + String(expectedType) + '"');
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
}.bind(this);

/**
 * Adds a `def` method to the object returning a new object with passed in argument
 * as `default` property.
 *
 * @param {Object} type - Object to enhance.
 */
export var withDefault = function withDefault(type) {
  Object.defineProperty(type, 'def', {
    value: function value(def) {
      if (def === undefined && !this.default) {
        return this;
      }

      if (!isFunction(def) && !validateType(this, def)) {
        warn(String(this._vueTypes_name) + ' - invalid default value: "' + String(def) + '"', def);

        return this;
      }

      this.default = isArray(def) || isPlainObject(def) ? function getDefault() {
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
export var withRequired = function withRequired(type) {
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
export var toType = function (name, obj) {
  _newArrowCheck(this, _this);

  Object.defineProperty(obj, '_vueTypes_name', {
    value: name
  });

  withRequired(obj);
  withDefault(obj);

  if (isFunction(obj.validator)) {
    _Reflect$set(obj, 'validator', obj.validator.bind(obj));
  }

  return obj;
}.bind(this);

export { warn };