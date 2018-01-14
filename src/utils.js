import isPlainObject from 'lodash/isPlainObject';
import noop from 'lodash/noop';
import isNil from 'lodash/isNil';

const ObjProto = Object.prototype;
const $toString = ObjProto.toString;
export const hasOwn = ObjProto.hasOwnProperty;

const FN_MATCH_REGEXP = /^\s*function (\w+)/;

const getFnType = fn => (fn.type ? fn.type : fn);

// https://github.com/vuejs/vue/blob/dev/src/core/util/props.js#L159
export const getType = (fn) => {
  const type = isNil(fn) ? null : getFnType(fn);
  const match = type && type.toString().match(FN_MATCH_REGEXP);

  return match && match[1];
};

export const getNativeType = (value) => {
  if (isNil(value)) {
    return null;
  }

  const match = value.constructor.toString().match(FN_MATCH_REGEXP);

  return match && match[1];
};

/**
 * Checks for a own property in an object.
 *
 * @param {Object} obj - Object.
 * @param {string} prop - Property to check.
 */
export const has = (obj, prop) => hasOwn.call(obj, prop);

/**
 * Determines whether the passed value is an integer.
 * Uses `Number.isInteger` if available.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
 * @param {*} value - The value to be tested for being an integer.
 * @returns {boolean}
 */
export const isInteger = Number.isInteger || function isInteger(value) {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value; // eslint-disable-line no-restricted-globals
};

/**
 * Determines whether the passed value is an Array.
 *
 * @param {*} value - The value to be tested for being an array.
 * @returns {boolean}
 */
export const isArray = Array.isArray || function isArray(value) {
  return toString.call(value) === '[object Array]';
};

/**
 * Checks if a value is a function.
 *
 * @param {any} value - Value to check.
 * @returns {boolean}
 */
export const isFunction = value => $toString.call(value) === '[object Function]';

const warn = (function getWarn() {
  if (process.env.NODE_ENV === 'production' || typeof console === 'undefined') {
    return noop;
  }

  return msg => console.warn(`[VueTypes warn]: ${msg}`); // eslint-disable-line no-console
}());

/**
 * Validates a given value against a prop type object.
 *
 * @param {Object|*} type - Type to use for validation. Either a type object or a constructor.
 * @param {*} value - Value to check.
 * @param {boolean} silent - Silence warnings.
 * @returns {boolean}
 */
export const validateType = (type, value, silent = false) => {
  let typeToCheck = type;
  let valid = true;
  let expectedType;
  if (!isPlainObject(type)) {
    typeToCheck = {
      type,
    };
  }

  const namePrefix = typeToCheck._vueTypes_name ? (`${typeToCheck._vueTypes_name} - `) : '';

  if (hasOwn.call(typeToCheck, 'type') && typeToCheck.type !== null) {
    if (isArray(typeToCheck.type)) {
      valid = typeToCheck.type.some(T => validateType(T, value, true));
      expectedType = typeToCheck.type.map(T => getType(T)).join(' or ');
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
      warn(`${namePrefix}value "${value}" should be of type "${expectedType}"`);
    }

    return false;
  }

  if (hasOwn.call(typeToCheck, 'validator') && isFunction(typeToCheck.validator)) {
    valid = typeToCheck.validator(value);
    if (!valid && silent === false) {
      warn(`${namePrefix}custom validation failed`);
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
export const withDefault = function withDefault(type) {
  Object.defineProperty(type, 'def', {
    value(def) {
      if (def === undefined && !this.default) {
        return this;
      }

      if (!isFunction(def) && !validateType(this, def)) {
        warn(`${this._vueTypes_name} - invalid default value: "${def}"`, def);

        return this;
      }

      this.default = (isArray(def) || isPlainObject(def)) ? function getDefault() {
        return def;
      } : def;

      return this;
    },
  });
};

/**
 * Adds a `isRequired` getter returning a new object with `required: true` key-value.
 *
 * @param {Object} type - Object to enhance.
 */
export const withRequired = function withRequired(type) {
  Object.defineProperty(type, 'isRequired', {
    get() {
      this.required = true;
      return this;
    },
  });
};

/**
 * Adds `isRequired` and `def` modifiers to an object.
 *
 * @param {string} name - Type internal name.
 * @param {Object} obj - Object to enhance.
 * @returns {Object}
 */
export const toType = (name, obj) => {
  Object.defineProperty(obj, '_vueTypes_name', {
    value: name,
  });

  withRequired(obj);
  withDefault(obj);

  if (isFunction(obj.validator)) {
    Reflect.set(obj, 'validator', obj.validator.bind(obj));
  }

  return obj;
};

export {
  warn,
};
