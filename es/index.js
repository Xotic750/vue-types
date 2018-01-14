import _typeof from 'babel-runtime/helpers/typeof';
import _Object$keys from 'babel-runtime/core-js/object/keys';
import _Object$defineProperties from 'babel-runtime/core-js/object/define-properties';
import _newArrowCheck from 'babel-runtime/helpers/newArrowCheck';

var _this = this;

import isPlainObject from 'lodash/isPlainObject';
import noop from 'lodash/noop';
import isNil from 'lodash/isNil';
import stubArray from 'lodash/stubArray';
import stubObject from 'lodash/stubObject';

import { toType, getType, isFunction, validateType, isInteger, isArray, warn } from './utils';

var typeDefaults = function () {
  _newArrowCheck(this, _this);

  return {
    func: noop,
    bool: true,
    string: '',
    number: 0,
    array: stubArray,
    object: stubObject,
    integer: 0
  };
}.bind(this);

var currentDefaults = typeDefaults();

var VuePropTypes = _Object$defineProperties({
  custom: function custom(validatorFn) {
    var warnMsg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'custom validation failed';

    if (typeof validatorFn !== 'function') {
      throw new TypeError('[VueTypes error]: You must provide a function as argument');
    }

    return toType(validatorFn.name || '<<anonymous function>>', {
      validator: function validator() {
        var valid = validatorFn.apply(undefined, arguments);
        if (!valid) {
          warn(String(this._vueTypes_name) + ' - ' + String(warnMsg));
        }

        return valid;
      }
    });
  },
  oneOf: function oneOf(arr) {
    var _this2 = this;

    if (!isArray(arr)) {
      throw new TypeError('[VueTypes error]: You must provide an array as argument');
    }
    var msg = 'oneOf - value should be one of "' + String(arr.join('", "')) + '"';
    var allowedTypes = arr.reduce(function (ret, v) {
      _newArrowCheck(this, _this2);

      if (!isNil(v)) {
        if (ret.indexOf(v.constructor) === -1) {
          ret.push(v.constructor);
        }
      }
      return ret;
    }.bind(this), []);

    return toType('oneOf', {
      type: allowedTypes.length > 0 ? allowedTypes : null,
      validator: function validator(value) {
        var valid = arr.indexOf(value) !== -1;
        if (!valid) {
          warn(msg);
        }

        return valid;
      }
    });
  },
  instanceOf: function instanceOf(instanceConstructor) {
    return toType('instanceOf', {
      type: instanceConstructor
    });
  },
  oneOfType: function oneOfType(arr) {
    var _this3 = this;

    if (!isArray(arr)) {
      throw new TypeError('[VueTypes error]: You must provide an array as argument');
    }

    var hasCustomValidators = false;

    var nativeChecks = arr.reduce(function (ret, type) {
      _newArrowCheck(this, _this3);

      if (isPlainObject(type)) {
        if (type._vueTypes_name === 'oneOf') {
          return ret.concat(type.type || []);
        }

        if (type.type && !isFunction(type.validator)) {
          if (isArray(type.type)) return ret.concat(type.type);
          ret.push(type.type);
        } else if (isFunction(type.validator)) {
          hasCustomValidators = true;
        }

        return ret;
      }
      ret.push(type);
      return ret;
    }.bind(this), []);

    if (!hasCustomValidators) {
      // we got just native objects (ie: Array, Object)
      // delegate to Vue native prop check
      return toType('oneOfType', {
        type: nativeChecks
      });
    }

    var typesStr = arr.map(function (type) {
      _newArrowCheck(this, _this3);

      if (type && isArray(type.type)) {
        return type.type.map(getType);
      }

      return getType(type);
    }.bind(this)).reduce(function (ret, type) {
      _newArrowCheck(this, _this3);

      return ret.concat(isArray(type) ? type : [type]);
    }.bind(this), []).join('", "');

    return this.custom(function (value) {
      _newArrowCheck(this, _this3);

      var valid = arr.some(function (type) {
        _newArrowCheck(this, _this3);

        if (type._vueTypes_name === 'oneOf') {
          return type.type ? validateType(type.type, value, true) : true;
        }

        return validateType(type, value, true);
      }.bind(this));

      if (!valid) {
        warn('oneOfType - value type should be one of "' + String(typesStr) + '"');
      }

      return valid;
    }.bind(this));
  },
  arrayOf: function arrayOf(type) {
    return toType('arrayOf', {
      type: Array,
      validator: function validator(values) {
        var _this4 = this;

        var valid = values.every(function (value) {
          _newArrowCheck(this, _this4);

          return validateType(type, value);
        }.bind(this));
        if (!valid) {
          warn('arrayOf - value must be an array of "' + String(getType(type)) + '"');
        }

        return valid;
      }
    });
  },
  objectOf: function objectOf(type) {
    return toType('objectOf', {
      type: Object,
      validator: function validator(obj) {
        var _this5 = this;

        var valid = _Object$keys(obj).every(function (key) {
          _newArrowCheck(this, _this5);

          return validateType(type, obj[key]);
        }.bind(this));
        if (!valid) {
          warn('objectOf - value must be an object of "' + String(getType(type)) + '"');
        }

        return valid;
      }
    });
  },
  shape: function shape(obj) {
    var _this6 = this;

    var keys = _Object$keys(obj);
    var requiredKeys = keys.filter(function (key) {
      _newArrowCheck(this, _this6);

      return obj[key] && obj[key].required === true;
    }.bind(this));

    var type = toType('shape', {
      type: Object,
      validator: function validator(value) {
        var _this7 = this;

        if (!isPlainObject(value)) {
          return false;
        }

        var valueKeys = _Object$keys(value);

        // check for required keys (if any)
        if (requiredKeys.length > 0 && requiredKeys.some(function (req) {
          _newArrowCheck(this, _this7);

          return valueKeys.indexOf(req) === -1;
        }.bind(this))) {
          warn('shape - at least one of required properties "' + String(requiredKeys.join('", "')) + '" is not present');

          return false;
        }

        return valueKeys.every(function (key) {
          _newArrowCheck(this, _this7);

          if (keys.indexOf(key) === -1) {
            if (this._vueTypes_isLoose === true) {
              return true;
            }

            warn('shape - object is missing "' + String(key) + '" property');

            return false;
          }

          return validateType(obj[key], value[key]);
        }.bind(this));
      }
    });

    Object.defineProperty(type, '_vueTypes_isLoose', {
      value: false,
      writable: true
    });

    Object.defineProperty(type, 'loose', {
      get: function get() {
        this._vueTypes_isLoose = true;

        return this;
      }
    });

    return type;
  }
}, {
  any: {
    get: function get() {
      return toType('any', {
        type: null
      });
    },
    configurable: true,
    enumerable: true
  },
  func: {
    get: function get() {
      return toType('function', {
        type: Function
      }).def(currentDefaults.func);
    },
    configurable: true,
    enumerable: true
  },
  bool: {
    get: function get() {
      return toType('boolean', {
        type: Boolean
      }).def(currentDefaults.bool);
    },
    configurable: true,
    enumerable: true
  },
  string: {
    get: function get() {
      return toType('string', {
        type: String
      }).def(currentDefaults.string);
    },
    configurable: true,
    enumerable: true
  },
  number: {
    get: function get() {
      return toType('number', {
        type: Number
      }).def(currentDefaults.number);
    },
    configurable: true,
    enumerable: true
  },
  array: {
    get: function get() {
      return toType('array', {
        type: Array
      }).def(currentDefaults.array);
    },
    configurable: true,
    enumerable: true
  },
  object: {
    get: function get() {
      return toType('object', {
        type: Object
      }).def(currentDefaults.object);
    },
    configurable: true,
    enumerable: true
  },
  integer: {
    get: function get() {
      return toType('integer', {
        type: Number,
        validator: function validator(value) {
          return isInteger(value);
        }
      }).def(currentDefaults.integer);
    },
    configurable: true,
    enumerable: true
  },
  symbol: {
    get: function get() {
      return toType('symbol', {
        type: null,
        validator: function validator(value) {
          return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'symbol';
        }
      });
    },
    configurable: true,
    enumerable: true
  }
});

Object.defineProperty(VuePropTypes, 'sensibleDefaults', {
  set: function set(value) {
    if (value === false) {
      currentDefaults = {};
    } else if (value === true) {
      currentDefaults = typeDefaults();
    } else if (isPlainObject(value)) {
      currentDefaults = value;
    }
  },
  get: function get() {
    return currentDefaults;
  }
});

export default VuePropTypes;