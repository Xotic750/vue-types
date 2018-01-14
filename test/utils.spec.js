import expect from 'expect';
import {
  toType,
} from '../src/utils';

describe('`toType()`', () => {
  it('should enhance the passed-in object without cloning', () => {
    const obj = {};

    const type = toType('testType', obj);
    expect(type).toBe(obj);
  });

  it('should call `withRequired` on passed in object', () => {
    const obj = {};

    toType('testType', obj);
    expect(obj.hasOwnProperty('isRequired')).toBe(true); // eslint-disable-line no-prototype-builtins
  });

  it('should call `withDefault` on passed in object', () => {
    const obj = {};

    toType('testType', obj);
    expect(obj.def).toBeA(Function);
  });

  it('should bind provided `validator function to the passed in object`', () => {
    const obj = {
      validator() {
        return this;
      },
    };

    const type = toType('testType', obj);
    const {
      validator,
    } = type;

    expect(validator()).toBe(obj);
  });
});
