(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.JSON5 = factory());
}(this, function () { 'use strict';

  var ceil = Math.ceil;
  var floor = Math.floor;

  // `ToInteger` abstract operation
  // https://tc39.github.io/ecma262/#sec-tointeger
  var toInteger = function (argument) {
    return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
  };

  // `RequireObjectCoercible` abstract operation
  // https://tc39.github.io/ecma262/#sec-requireobjectcoercible
  var requireObjectCoercible = function (it) {
    if (it == undefined) { throw TypeError("Can't call method on " + it); }
    return it;
  };

  // CONVERT_TO_STRING: true  -> String#at
  // CONVERT_TO_STRING: false -> String#codePointAt
  var stringAt = function (that, pos, CONVERT_TO_STRING) {
    var S = String(requireObjectCoercible(that));
    var position = toInteger(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) { return CONVERT_TO_STRING ? '' : undefined; }
    first = S.charCodeAt(position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING ? S.charAt(position) : first
        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };

  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  var global = typeof window == 'object' && window && window.Math == Math ? window
    : typeof self == 'object' && self && self.Math == Math ? self
    // eslint-disable-next-line no-new-func
    : Function('return this')();

  var fails = function (exec) {
    try {
      return !!exec();
    } catch (error) {
      return true;
    }
  };

  // Thank's IE8 for his funny defineProperty
  var descriptors = !fails(function () {
    return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
  });

  var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
  var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

  // Nashorn ~ JDK8 bug
  var NASHORN_BUG = nativeGetOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

  var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
    var descriptor = nativeGetOwnPropertyDescriptor(this, V);
    return !!descriptor && descriptor.enumerable;
  } : nativePropertyIsEnumerable;

  var objectPropertyIsEnumerable = {
  	f: f
  };

  var createPropertyDescriptor = function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var toString = {}.toString;

  var classofRaw = function (it) {
    return toString.call(it).slice(8, -1);
  };

  // fallback for non-array-like ES3 and non-enumerable old V8 strings


  var split = ''.split;

  var indexedObject = fails(function () {
    // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
    // eslint-disable-next-line no-prototype-builtins
    return !Object('z').propertyIsEnumerable(0);
  }) ? function (it) {
    return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
  } : Object;

  // toObject with fallback for non-array-like ES3 strings



  var toIndexedObject = function (it) {
    return indexedObject(requireObjectCoercible(it));
  };

  var isObject = function (it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };

  // 7.1.1 ToPrimitive(input [, PreferredType])

  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string
  var toPrimitive = function (it, S) {
    if (!isObject(it)) { return it; }
    var fn, val;
    if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) { return val; }
    if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) { return val; }
    if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) { return val; }
    throw TypeError("Can't convert object to primitive value");
  };

  var hasOwnProperty = {}.hasOwnProperty;

  var has = function (it, key) {
    return hasOwnProperty.call(it, key);
  };

  var document = global.document;
  // typeof document.createElement is 'object' in old IE
  var exist = isObject(document) && isObject(document.createElement);

  var documentCreateElement = function (it) {
    return exist ? document.createElement(it) : {};
  };

  // Thank's IE8 for his funny defineProperty
  var ie8DomDefine = !descriptors && !fails(function () {
    return Object.defineProperty(documentCreateElement('div'), 'a', {
      get: function () { return 7; }
    }).a != 7;
  });

  var nativeGetOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;

  var f$1 = descriptors ? nativeGetOwnPropertyDescriptor$1 : function getOwnPropertyDescriptor(O, P) {
    O = toIndexedObject(O);
    P = toPrimitive(P, true);
    if (ie8DomDefine) { try {
      return nativeGetOwnPropertyDescriptor$1(O, P);
    } catch (error) { /* empty */ } }
    if (has(O, P)) { return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]); }
  };

  var objectGetOwnPropertyDescriptor = {
  	f: f$1
  };

  var anObject = function (it) {
    if (!isObject(it)) {
      throw TypeError(String(it) + ' is not an object');
    } return it;
  };

  var nativeDefineProperty = Object.defineProperty;

  var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
    anObject(O);
    P = toPrimitive(P, true);
    anObject(Attributes);
    if (ie8DomDefine) { try {
      return nativeDefineProperty(O, P, Attributes);
    } catch (error) { /* empty */ } }
    if ('get' in Attributes || 'set' in Attributes) { throw TypeError('Accessors not supported'); }
    if ('value' in Attributes) { O[P] = Attributes.value; }
    return O;
  };

  var objectDefineProperty = {
  	f: f$2
  };

  var hide = descriptors ? function (object, key, value) {
    return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var setGlobal = function (key, value) {
    try {
      hide(global, key, value);
    } catch (error) {
      global[key] = value;
    } return value;
  };

  var shared = createCommonjsModule(function (module) {
  var SHARED = '__core-js_shared__';
  var store = global[SHARED] || setGlobal(SHARED, {});

  (module.exports = function (key, value) {
    return store[key] || (store[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: '3.0.1',
    mode: 'global',
    copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
  });
  });

  var functionToString = shared('native-function-to-string', Function.toString);

  var WeakMap = global.WeakMap;

  var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(functionToString.call(WeakMap));

  var id = 0;
  var postfix = Math.random();

  var uid = function (key) {
    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + postfix).toString(36));
  };

  var shared$1 = shared('keys');


  var sharedKey = function (key) {
    return shared$1[key] || (shared$1[key] = uid(key));
  };

  var hiddenKeys = {};

  var WeakMap$1 = global.WeakMap;
  var set, get, has$1;

  var enforce = function (it) {
    return has$1(it) ? get(it) : set(it, {});
  };

  var getterFor = function (TYPE) {
    return function (it) {
      var state;
      if (!isObject(it) || (state = get(it)).type !== TYPE) {
        throw TypeError('Incompatible receiver, ' + TYPE + ' required');
      } return state;
    };
  };

  if (nativeWeakMap) {
    var store = new WeakMap$1();
    var wmget = store.get;
    var wmhas = store.has;
    var wmset = store.set;
    set = function (it, metadata) {
      wmset.call(store, it, metadata);
      return metadata;
    };
    get = function (it) {
      return wmget.call(store, it) || {};
    };
    has$1 = function (it) {
      return wmhas.call(store, it);
    };
  } else {
    var STATE = sharedKey('state');
    hiddenKeys[STATE] = true;
    set = function (it, metadata) {
      hide(it, STATE, metadata);
      return metadata;
    };
    get = function (it) {
      return has(it, STATE) ? it[STATE] : {};
    };
    has$1 = function (it) {
      return has(it, STATE);
    };
  }

  var internalState = {
    set: set,
    get: get,
    has: has$1,
    enforce: enforce,
    getterFor: getterFor
  };

  var redefine = createCommonjsModule(function (module) {
  var getInternalState = internalState.get;
  var enforceInternalState = internalState.enforce;
  var TEMPLATE = String(functionToString).split('toString');

  shared('inspectSource', function (it) {
    return functionToString.call(it);
  });

  (module.exports = function (O, key, value, options) {
    var unsafe = options ? !!options.unsafe : false;
    var simple = options ? !!options.enumerable : false;
    var noTargetGet = options ? !!options.noTargetGet : false;
    if (typeof value == 'function') {
      if (typeof key == 'string' && !has(value, 'name')) { hide(value, 'name', key); }
      enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
    }
    if (O === global) {
      if (simple) { O[key] = value; }
      else { setGlobal(key, value); }
      return;
    } else if (!unsafe) {
      delete O[key];
    } else if (!noTargetGet && O[key]) {
      simple = true;
    }
    if (simple) { O[key] = value; }
    else { hide(O, key, value); }
  // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
  })(Function.prototype, 'toString', function toString() {
    return typeof this == 'function' && getInternalState(this).source || functionToString.call(this);
  });
  });

  var min = Math.min;

  // `ToLength` abstract operation
  // https://tc39.github.io/ecma262/#sec-tolength
  var toLength = function (argument) {
    return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
  };

  var max = Math.max;
  var min$1 = Math.min;

  // Helper for a popular repeating case of the spec:
  // Let integer be ? ToInteger(index).
  // If integer < 0, let result be max((length + integer), 0); else let result be min(length, length).
  var toAbsoluteIndex = function (index, length) {
    var integer = toInteger(index);
    return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
  };

  // `Array.prototype.{ indexOf, includes }` methods implementation
  // false -> Array#indexOf
  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
  // true  -> Array#includes
  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
  var arrayIncludes = function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = toIndexedObject($this);
      var length = toLength(O.length);
      var index = toAbsoluteIndex(fromIndex, length);
      var value;
      // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare
      if (IS_INCLUDES && el != el) { while (length > index) {
        value = O[index++];
        // eslint-disable-next-line no-self-compare
        if (value != value) { return true; }
      // Array#indexOf ignores holes, Array#includes - not
      } } else { for (;length > index; index++) { if (IS_INCLUDES || index in O) {
        if (O[index] === el) { return IS_INCLUDES || index || 0; }
      } } } return !IS_INCLUDES && -1;
    };
  };

  var arrayIndexOf = arrayIncludes(false);


  var objectKeysInternal = function (object, names) {
    var O = toIndexedObject(object);
    var i = 0;
    var result = [];
    var key;
    for (key in O) { !has(hiddenKeys, key) && has(O, key) && result.push(key); }
    // Don't enum bug & hidden keys
    while (names.length > i) { if (has(O, key = names[i++])) {
      ~arrayIndexOf(result, key) || result.push(key);
    } }
    return result;
  };

  // IE8- don't enum bug keys
  var enumBugKeys = [
    'constructor',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'toLocaleString',
    'toString',
    'valueOf'
  ];

  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)

  var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');

  var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
    return objectKeysInternal(O, hiddenKeys$1);
  };

  var objectGetOwnPropertyNames = {
  	f: f$3
  };

  var f$4 = Object.getOwnPropertySymbols;

  var objectGetOwnPropertySymbols = {
  	f: f$4
  };

  var Reflect = global.Reflect;

  // all object keys, includes non-enumerable and symbols
  var ownKeys = Reflect && Reflect.ownKeys || function ownKeys(it) {
    var keys = objectGetOwnPropertyNames.f(anObject(it));
    var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
    return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
  };

  var copyConstructorProperties = function (target, source) {
    var keys = ownKeys(source);
    var defineProperty = objectDefineProperty.f;
    var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (!has(target, key)) { defineProperty(target, key, getOwnPropertyDescriptor(source, key)); }
    }
  };

  var replacement = /#|\.prototype\./;

  var isForced = function (feature, detection) {
    var value = data[normalize(feature)];
    return value == POLYFILL ? true
      : value == NATIVE ? false
      : typeof detection == 'function' ? fails(detection)
      : !!detection;
  };

  var normalize = isForced.normalize = function (string) {
    return String(string).replace(replacement, '.').toLowerCase();
  };

  var data = isForced.data = {};
  var NATIVE = isForced.NATIVE = 'N';
  var POLYFILL = isForced.POLYFILL = 'P';

  var isForced_1 = isForced;

  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;






  /*
    options.target      - name of the target object
    options.global      - target is the global object
    options.stat        - export as static methods of target
    options.proto       - export as prototype methods of target
    options.real        - real prototype method for the `pure` version
    options.forced      - export even if the native feature is available
    options.bind        - bind methods to the target, required for the `pure` version
    options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
    options.unsafe      - use the simple assignment of property instead of delete + defineProperty
    options.sham        - add a flag to not completely full polyfills
    options.enumerable  - export as enumerable property
    options.noTargetGet - prevent calling a getter on target
  */
  var _export = function (options, source) {
    var TARGET = options.target;
    var GLOBAL = options.global;
    var STATIC = options.stat;
    var FORCED, target, key, targetProperty, sourceProperty, descriptor;
    if (GLOBAL) {
      target = global;
    } else if (STATIC) {
      target = global[TARGET] || setGlobal(TARGET, {});
    } else {
      target = (global[TARGET] || {}).prototype;
    }
    if (target) { for (key in source) {
      sourceProperty = source[key];
      if (options.noTargetGet) {
        descriptor = getOwnPropertyDescriptor(target, key);
        targetProperty = descriptor && descriptor.value;
      } else { targetProperty = target[key]; }
      FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
      // contained in target
      if (!FORCED && targetProperty !== undefined) {
        if (typeof sourceProperty === typeof targetProperty) { continue; }
        copyConstructorProperties(sourceProperty, targetProperty);
      }
      // add a flag to not completely full polyfills
      if (options.sham || (targetProperty && targetProperty.sham)) {
        hide(sourceProperty, 'sham', true);
      }
      // extend global
      redefine(target, key, sourceProperty, options);
    } }
  };

  // `String.prototype.codePointAt` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
  _export({ target: 'String', proto: true }, {
    codePointAt: function codePointAt(pos) {
      return stringAt(this, pos);
    }
  });

  var aFunction = function (it) {
    if (typeof it != 'function') {
      throw TypeError(String(it) + ' is not a function');
    } return it;
  };

  // optional / simple context binding
  var bindContext = function (fn, that, length) {
    aFunction(fn);
    if (that === undefined) { return fn; }
    switch (length) {
      case 0: return function () {
        return fn.call(that);
      };
      case 1: return function (a) {
        return fn.call(that, a);
      };
      case 2: return function (a, b) {
        return fn.call(that, a, b);
      };
      case 3: return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
    }
    return function (/* ...args */) {
      return fn.apply(that, arguments);
    };
  };

  var call = Function.call;

  var entryUnbind = function (CONSTRUCTOR, METHOD, length) {
    return bindContext(call, global[CONSTRUCTOR].prototype[METHOD], length);
  };

  var codePointAt = entryUnbind('String', 'codePointAt');

  var fromCharCode = String.fromCharCode;
  var nativeFromCodePoint = String.fromCodePoint;

  // length should be 1, old FF problem
  var INCORRECT_LENGTH = !!nativeFromCodePoint && nativeFromCodePoint.length != 1;

  // `String.fromCodePoint` method
  // https://tc39.github.io/ecma262/#sec-string.fromcodepoint
  _export({ target: 'String', stat: true, forced: INCORRECT_LENGTH }, {
    fromCodePoint: function fromCodePoint(x) {
      var arguments$1 = arguments;
   // eslint-disable-line no-unused-vars
      var elements = [];
      var length = arguments.length;
      var i = 0;
      var code;
      while (length > i) {
        code = +arguments$1[i++];
        if (toAbsoluteIndex(code, 0x10FFFF) !== code) { throw RangeError(code + ' is not a valid code point'); }
        elements.push(code < 0x10000
          ? fromCharCode(code)
          : fromCharCode(((code -= 0x10000) >> 10) + 0xD800, code % 0x400 + 0xDC00)
        );
      } return elements.join('');
    }
  });

  var path = global;

  var fromCodePoint = path.String.fromCodePoint;

  // This is a generated file. Do not edit.
  var Space_Separator = /[\u1680\u2000-\u200A\u202F\u205F\u3000]/;
  var ID_Start = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE83\uDE86-\uDE89\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]/;
  var ID_Continue = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09FC\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF9\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDE00-\uDE3E\uDE47\uDE50-\uDE83\uDE86-\uDE99\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/;

  var unicode = {
  	Space_Separator: Space_Separator,
  	ID_Start: ID_Start,
  	ID_Continue: ID_Continue
  };

  var util = {
      isSpaceSeparator: function isSpaceSeparator (c) {
          return unicode.Space_Separator.test(c)
      },

      isIdStartChar: function isIdStartChar (c) {
          return (
              (c >= 'a' && c <= 'z') ||
          (c >= 'A' && c <= 'Z') ||
          (c === '$') || (c === '_') ||
          unicode.ID_Start.test(c)
          )
      },

      isIdContinueChar: function isIdContinueChar (c) {
          return (
              (c >= 'a' && c <= 'z') ||
          (c >= 'A' && c <= 'Z') ||
          (c >= '0' && c <= '9') ||
          (c === '$') || (c === '_') ||
          (c === '\u200C') || (c === '\u200D') ||
          unicode.ID_Continue.test(c)
          )
      },

      isDigit: function isDigit (c) {
          return /[0-9]/.test(c)
      },

      isHexDigit: function isHexDigit (c) {
          return /[0-9A-Fa-f]/.test(c)
      },
  };

  var source;
  var parseState;
  var stack;
  var pos;
  var line;
  var column;
  var token;
  var key;
  var root;

  var parse = function parse (text, reviver) {
      source = String(text);
      parseState = 'start';
      stack = [];
      pos = 0;
      line = 1;
      column = 0;
      token = undefined;
      key = undefined;
      root = undefined;

      do {
          token = lex();

          // This code is unreachable.
          // if (!parseStates[parseState]) {
          //     throw invalidParseState()
          // }

          parseStates[parseState]();
      } while (token.type !== 'eof')

      if (typeof reviver === 'function') {
          return internalize({'': root}, '', reviver)
      }

      return root
  };

  function internalize (holder, name, reviver) {
      var value = holder[name];
      if (value != null && typeof value === 'object') {
          for (var key in value) {
              var replacement = internalize(value, key, reviver);
              if (replacement === undefined) {
                  delete value[key];
              } else {
                  value[key] = replacement;
              }
          }
      }

      return reviver.call(holder, name, value)
  }

  var lexState;
  var buffer;
  var doubleQuote;
  var sign;
  var c;
  var heredocMarker;

  function lex () {
      lexState = 'default';
      buffer = '';
      doubleQuote = false;
      sign = 1;

      for (;;) {
          c = peek();

          // This code is unreachable.
          // if (!lexStates[lexState]) {
          //     throw invalidLexState(lexState)
          // }

          var token = lexStates[lexState]();
          if (token) {
              return token
          }
      }
  }

  function peek () {
      if (source[pos]) {
          return String.fromCodePoint(source.codePointAt(pos))
      }
  }

  function read () {
      var c = peek();

      if (c === '\n') {
          line++;
          column = 0;
      } else if (c) {
          column += c.length;
      } else {
          column++;
      }

      if (c) {
          pos += c.length;
      }

      return c
  }

  var lexStates = {
      default: function default$1 () {
          switch (c) {
          case '\t':
          case '\v':
          case '\f':
          case ' ':
          case '\u00A0':
          case '\uFEFF':
          case '\n':
          case '\r':
          case '\u2028':
          case '\u2029':
              read();
              return

          case '/':
              read();
              lexState = 'comment';
              return

          case undefined:
              read();
              return newToken('eof')
          }

          if (util.isSpaceSeparator(c)) {
              read();
              return
          }

          // This code is unreachable.
          // if (!lexStates[parseState]) {
          //     throw invalidLexState(parseState)
          // }

          return lexStates[parseState]()
      },

      comment: function comment () {
          switch (c) {
          case '*':
              read();
              lexState = 'multiLineComment';
              return

          case '/':
              read();
              lexState = 'singleLineComment';
              return
          }

          throw invalidChar(read())
      },

      multiLineComment: function multiLineComment () {
          switch (c) {
          case '*':
              read();
              lexState = 'multiLineCommentAsterisk';
              return

          case undefined:
              throw invalidChar(read())
          }

          read();
      },

      multiLineCommentAsterisk: function multiLineCommentAsterisk () {
          switch (c) {
          case '*':
              read();
              return

          case '/':
              read();
              lexState = 'default';
              return

          case undefined:
              throw invalidChar(read())
          }

          read();
          lexState = 'multiLineComment';
      },

      singleLineComment: function singleLineComment () {
          switch (c) {
          case '\n':
          case '\r':
          case '\u2028':
          case '\u2029':
              read();
              lexState = 'default';
              return

          case undefined:
              read();
              return newToken('eof')
          }

          read();
      },

      value: function value () {
          switch (c) {
          case '{':
          case '[':
              return newToken('punctuator', read())

          case 'n':
              read();
              literal('ull');
              return newToken('null', null)

          case 't':
              read();
              literal('rue');
              return newToken('boolean', true)

          case 'f':
              read();
              literal('alse');
              return newToken('boolean', false)

          case '-':
          case '+':
              if (read() === '-') {
                  sign = -1;
              }

              lexState = 'sign';
              return

          case '.':
              buffer = read();
              lexState = 'decimalPointLeading';
              return

          case '0':
              buffer = read();
              lexState = 'zero';
              return

          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
              buffer = read();
              lexState = 'decimalInteger';
              return

          case 'I':
              read();
              literal('nfinity');
              return newToken('numeric', Infinity)

          case 'N':
              read();
              literal('aN');
              return newToken('numeric', NaN)

          case '"':
          case "'":
              doubleQuote = (read() === '"');
              buffer = '';
              lexState = 'string';
              return

          case '`':
              read();
              buffer = '';
              lexState = 'es6string';
              return

          case '<':
              read();
              buffer = '';
              lexState = 'heredoc';
              return
          }

          throw invalidChar(read())
      },

      identifierNameStartEscape: function identifierNameStartEscape () {
          if (c !== 'u') {
              throw invalidChar(read())
          }

          read();
          var u = unicodeEscape();
          switch (u) {
          case '$':
          case '_':
              break

          default:
              if (!util.isIdStartChar(u)) {
                  throw invalidIdentifier()
              }

              break
          }

          buffer += u;
          lexState = 'identifierName';
      },

      identifierName: function identifierName () {
          switch (c) {
          case '$':
          case '_':
          case '\u200C':
          case '\u200D':
              buffer += read();
              return

          case '\\':
              read();
              lexState = 'identifierNameEscape';
              return
          }

          if (util.isIdContinueChar(c)) {
              buffer += read();
              return
          }

          return newToken('identifier', buffer)
      },

      identifierNameEscape: function identifierNameEscape () {
          if (c !== 'u') {
              throw invalidChar(read())
          }

          read();
          var u = unicodeEscape();
          switch (u) {
          case '$':
          case '_':
          case '\u200C':
          case '\u200D':
              break

          default:
              if (!util.isIdContinueChar(u)) {
                  throw invalidIdentifier()
              }

              break
          }

          buffer += u;
          lexState = 'identifierName';
      },

      sign: function sign$1 () {
          switch (c) {
          case '.':
              buffer = read();
              lexState = 'decimalPointLeading';
              return

          case '0':
              buffer = read();
              lexState = 'zero';
              return

          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
              buffer = read();
              lexState = 'decimalInteger';
              return

          case 'I':
              read();
              literal('nfinity');
              return newToken('numeric', sign * Infinity)

          case 'N':
              read();
              literal('aN');
              return newToken('numeric', NaN)
          }

          throw invalidChar(read())
      },

      zero: function zero () {
          switch (c) {
          case '.':
              buffer += read();
              lexState = 'decimalPoint';
              return

          case 'e':
          case 'E':
              buffer += read();
              lexState = 'decimalExponent';
              return

          case 'x':
          case 'X':
              buffer += read();
              lexState = 'hexadecimal';
              return
          }

          return newToken('numeric', sign * 0)
      },

      decimalInteger: function decimalInteger () {
          switch (c) {
          case '.':
              buffer += read();
              lexState = 'decimalPoint';
              return

          case 'e':
          case 'E':
              buffer += read();
              lexState = 'decimalExponent';
              return
          }

          if (util.isDigit(c)) {
              buffer += read();
              return
          }

          return newToken('numeric', sign * Number(buffer))
      },

      decimalPointLeading: function decimalPointLeading () {
          if (util.isDigit(c)) {
              buffer += read();
              lexState = 'decimalFraction';
              return
          }

          throw invalidChar(read())
      },

      decimalPoint: function decimalPoint () {
          switch (c) {
          case 'e':
          case 'E':
              buffer += read();
              lexState = 'decimalExponent';
              return
          }

          if (util.isDigit(c)) {
              buffer += read();
              lexState = 'decimalFraction';
              return
          }

          return newToken('numeric', sign * Number(buffer))
      },

      decimalFraction: function decimalFraction () {
          switch (c) {
          case 'e':
          case 'E':
              buffer += read();
              lexState = 'decimalExponent';
              return
          }

          if (util.isDigit(c)) {
              buffer += read();
              return
          }

          return newToken('numeric', sign * Number(buffer))
      },

      decimalExponent: function decimalExponent () {
          switch (c) {
          case '+':
          case '-':
              buffer += read();
              lexState = 'decimalExponentSign';
              return
          }

          if (util.isDigit(c)) {
              buffer += read();
              lexState = 'decimalExponentInteger';
              return
          }

          throw invalidChar(read())
      },

      decimalExponentSign: function decimalExponentSign () {
          if (util.isDigit(c)) {
              buffer += read();
              lexState = 'decimalExponentInteger';
              return
          }

          throw invalidChar(read())
      },

      decimalExponentInteger: function decimalExponentInteger () {
          if (util.isDigit(c)) {
              buffer += read();
              return
          }

          return newToken('numeric', sign * Number(buffer))
      },

      hexadecimal: function hexadecimal () {
          if (util.isHexDigit(c)) {
              buffer += read();
              lexState = 'hexadecimalInteger';
              return
          }

          throw invalidChar(read())
      },

      hexadecimalInteger: function hexadecimalInteger () {
          if (util.isHexDigit(c)) {
              buffer += read();
              return
          }

          return newToken('numeric', sign * Number(buffer))
      },

      string: function string () {
          switch (c) {
          case '\\':
              read();
              buffer += escape();
              return

          case '"':
              if (doubleQuote) {
                  read();
                  return newToken('string', buffer)
              }

              buffer += read();
              return

          case "'":
              if (!doubleQuote) {
                  read();
                  return newToken('string', buffer)
              }

              buffer += read();
              return

          case '\n':
          case '\r':
              throw invalidChar(read())

          case '\u2028':
          case '\u2029':
              separatorChar(c);
              break

          case undefined:
              throw invalidChar(read())
          }

          buffer += read();
      },

      es6string: function es6string () {
          switch (c) {
          case '\\':
              read();
              // since octal literals are not supported,
              // octal escapes in strings are not either.
              //
              // While https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals
              // says otherwise, we still DO NOT support octal escapes in JSON5 '`'-delimited multiline
              // strings, as these ARE NOT identical to JavaScript 'template strings' as we DO NOT
              // intend to support the `${...}` template variable expansion feature either!
              buffer += escape();
              return

          case '`':
              read();
              return newToken('string', buffer)

          case '\n':
          case '\r':
              // CR and CRLF get transformed to LF when the string being parsed is a `string template` type.
              if (c === '\r') {
                  read();
                  c = peek();
              }
              if (c === '\n') {
                  read();
                  c = peek();
              }
              buffer += '\n';
              return

          case undefined:
              throw invalidChar(read())
          }

          buffer += read();
      },

      // Parse a heredoc (string) value: start with extracting the EOT marker.
      heredoc: function heredoc () {
          // When parsing for heredoc values, we must extract the EOT marker before anything else.
          // Once we've done that, we skip the first newline and start scanning/consuming heredoc
          // content until we hit the EOT marker on a line by itself, sans whitespace.
          //
          // By convention we do not accept 'formatting whitespace/indentation' before the EOT
          // marker on the same line.
          //
          // we accept 2 or more(!) `<` characters to mark the start of a heredoc chunk:
          while (c === '<') {
              read();
              c = peek();
          }
          lexState = 'heredocStartMarker';
          heredocMarker = '';
      },

      heredocStartMarker: function heredocStartMarker () {
          // we accept any non-whitespace character sequence as heredoc EOT marker:
          while (/[^\s\r\n<>,"'\/\[\]\{\}]/.test(c)) { // eslint-disable-line no-useless-escape
              heredocMarker += read();
              c = peek();
          }
          if (!heredocMarker) {
              throw syntaxError(("JSON5: Expected heredoc starting EOT marker to immediately follow the initial << or <<< at " + line + ":" + column))
          }

          // the *content* of the heredoc starts after the first CR/LF;
          // we DO NOT tolerate trailing whitespace or any other cruft here!
          var eolSeen = false;
          if (c === '\r') {
              read();
              eolSeen = true;
              c = peek();
          }
          if (c === '\n') {
              read();
              eolSeen = true;
              c = peek();
          }
          if (!eolSeen) {
              throw syntaxError(("JSON5: Expected heredoc starting EOT marker to be terminated by a CR/LF or LF linefeed at " + line + ":" + column))
          }

          lexState = 'heredocContent';
      },

      heredocContent: function heredocContent () {
          // scan for a lone heredoc EOT marker; until we find one, everything is literal string content.
          // heredoc content doesn't process escape sequences: everything is passed on as-is!
          //
          // The content ENDS before the last CR/LF before the lone EOT marker; the EOT marker must exist
          // on a line by itself, without any preceeding or trailing whitespace.
          // If the JSON5 field is followed by more data, the separator (comma, bracket, ...) must exist
          // on the line *past* the EOT marker line: the EOT must be clearly 'alone' in there.
          var start = pos;
          var end = pos;
          var eotCh0 = heredocMarker[0];
          for (;;) {
              var idx = source.indexOf(eotCh0, pos);
              if (idx < 0) {
                  throw syntaxError(("JSON5: the heredoc string MUST be terminated by the sentinel \"" + heredocMarker + "\" on a separate line. Heredoc exists at " + line + ":" + column))
              }
              // we don't tolerate any whitespace leading the EOT marker:
              // it must be at the start of a new line!
              pos = idx - 1;
              var eol = peek();
              if (eol !== '\n' && eol !== '\r') {
                  // not a SOL, hence not a valid position: ignore and continue!
                  pos = idx + 1;
                  continue
              }
              // otherwise we MAY have a hit: check the entire EOT and make sure it's terminated by another CR/LF:
              end = pos;

              // by the way: when we see a LF before the EOT, it MAY be preceeded by a CR:
              if (eol === '\n') {
                  pos = idx - 2;
                  eol = peek();
                  if (eol === '\r') {
                      end = pos;
                  }
              }

              pos = idx;

              // now check to make sure we match the *entire* EOT marker at this location:
              var i = (void 0), len = (void 0);
              for (i = 1, len = heredocMarker.length; i < len; i++) {
                  if (heredocMarker[i] !== source[pos + i]) {
                      // only partial match: ignore & continue
                      pos += i;
                      break
                  }
              }
              if (i === len) {
                  // we matched a full EOT sentinel. Now is it terminated by CR/LF?
                  pos = idx + len;
                  c = peek();

                  var eolSeen = false;
                  // did we hit EOF?
                  if (c === undefined && pos >= source.length) {
                      eolSeen = true;
                  } else {
                      if (c === '\r') {
                          pos++;
                          eolSeen = true;
                          c = peek();
                      }
                      if (c === '\n') {
                          pos++;
                          eolSeen = true;
                          c = peek();
                      }
                  }
                  if (!eolSeen) {
                      // no 'lone EOT marker' hence we ignore & continue
                      continue
                  }
                  // else: we've got a winner! heredoc goes from `start` to `end`.
                  buffer = source.substring(start, end);

                  // replicate the peek()+read() location tracking functionality here
                  // for performance reasons:
                  var lines = buffer.split('\n');
                  line += lines.length + 1; /* line carrying the EOT marker */
                  // since a heredoc spans entire lines and the sentinel itself is terminated by another newline,
                  // we can safely reset the column value:
                  column = 0;

                  return newToken('string', buffer)
              }
              // otherwise, we didn't have a full EOT match, hence ignore & continue
              //
              // `pos` has already been adjusted, so no need to attend to that either.
              continue
          }
      },

      start: function start () {
          switch (c) {
          case '{':
          case '[':
              return newToken('punctuator', read())

          // This code is unreachable since the default lexState handles eof.
          // case undefined:
          //     return newToken('eof')
          }

          lexState = 'value';
      },

      beforePropertyName: function beforePropertyName () {
          switch (c) {
          case '$':
          case '_':
              buffer = read();
              lexState = 'identifierName';
              return

          case '\\':
              read();
              lexState = 'identifierNameStartEscape';
              return

          case '}':
              return newToken('punctuator', read())

          case '"':
          case "'":
              doubleQuote = (read() === '"');
              lexState = 'string';
              return
          }

          if (util.isIdStartChar(c)) {
              buffer += read();
              lexState = 'identifierName';
              return
          }

          throw invalidChar(read())
      },

      afterPropertyName: function afterPropertyName () {
          if (c === ':') {
              return newToken('punctuator', read())
          }

          throw invalidChar(read())
      },

      beforePropertyValue: function beforePropertyValue () {
          lexState = 'value';
      },

      afterPropertyValue: function afterPropertyValue () {
          switch (c) {
          case ',':
          case '}':
              return newToken('punctuator', read())
          }

          throw invalidChar(read())
      },

      beforeArrayValue: function beforeArrayValue () {
          if (c === ']') {
              return newToken('punctuator', read())
          }

          lexState = 'value';
      },

      afterArrayValue: function afterArrayValue () {
          switch (c) {
          case ',':
          case ']':
              return newToken('punctuator', read())
          }

          throw invalidChar(read())
      },

      end: function end () {
          // This code is unreachable since it's handled by the default lexState.
          // if (c === undefined) {
          //     read()
          //     return newToken('eof')
          // }

          throw invalidChar(read())
      },
  };

  function newToken (type, value) {
      return {
          type: type,
          value: value,
          line: line,
          column: column,
      }
  }

  function literal (s) {
      for (var i = 0, list = s; i < list.length; i += 1) {
          var c = list[i];

          var p = peek();

          if (p !== c) {
              throw invalidChar(read())
          }

          read();
      }
  }

  function escape () {
      var c = peek();
      switch (c) {
      case 'b':
          read();
          return '\b'

      case 'f':
          read();
          return '\f'

      case 'n':
          read();
          return '\n'

      case 'r':
          read();
          return '\r'

      case 't':
          read();
          return '\t'

      case 'v':
          read();
          return '\v'

      case '0':
          read();
          if (util.isDigit(peek())) {
              throw invalidChar(read())
          }

          return '\0'

      case 'x':
          read();
          return hexEscape()

      case 'u':
          read();
          return unicodeEscape()

      case '\n':
      case '\u2028':
      case '\u2029':
          read();
          return ''

      case '\r':
          read();
          if (peek() === '\n') {
              read();
          }

          return ''

      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
          throw invalidChar(read())

      case undefined:
          throw invalidChar(read())
      }

      return read()
  }

  function hexEscape () {
      var buffer = '';
      var c = peek();

      if (!util.isHexDigit(c)) {
          throw invalidChar(read())
      }

      buffer += read();

      c = peek();
      if (!util.isHexDigit(c)) {
          throw invalidChar(read())
      }

      buffer += read();

      return String.fromCodePoint(parseInt(buffer, 16))
  }

  function unicodeEscape () {
      var buffer = '';
      var count = 4;

      while (count-- > 0) {
          var c = peek();
          if (!util.isHexDigit(c)) {
              throw invalidChar(read())
          }

          buffer += read();
      }

      return String.fromCodePoint(parseInt(buffer, 16))
  }

  var parseStates = {
      start: function start () {
          if (token.type === 'eof') {
              throw invalidEOF()
          }

          push();
      },

      beforePropertyName: function beforePropertyName () {
          switch (token.type) {
          case 'identifier':
          case 'string':
              key = token.value;
              parseState = 'afterPropertyName';
              return

          case 'punctuator':
              // This code is unreachable since it's handled by the lexState.
              // if (token.value !== '}') {
              //     throw invalidToken()
              // }

              pop();
              return

          case 'eof':
              throw invalidEOF()
          }

          // This code is unreachable since it's handled by the lexState.
          // throw invalidToken()
      },

      afterPropertyName: function afterPropertyName () {
          // This code is unreachable since it's handled by the lexState.
          // if (token.type !== 'punctuator' || token.value !== ':') {
          //     throw invalidToken()
          // }

          if (token.type === 'eof') {
              throw invalidEOF()
          }

          parseState = 'beforePropertyValue';
      },

      beforePropertyValue: function beforePropertyValue () {
          if (token.type === 'eof') {
              throw invalidEOF()
          }

          push();
      },

      beforeArrayValue: function beforeArrayValue () {
          if (token.type === 'eof') {
              throw invalidEOF()
          }

          if (token.type === 'punctuator' && token.value === ']') {
              pop();
              return
          }

          push();
      },

      afterPropertyValue: function afterPropertyValue () {
          // This code is unreachable since it's handled by the lexState.
          // if (token.type !== 'punctuator') {
          //     throw invalidToken()
          // }

          if (token.type === 'eof') {
              throw invalidEOF()
          }

          switch (token.value) {
          case ',':
              parseState = 'beforePropertyName';
              return

          case '}':
              pop();
          }

          // This code is unreachable since it's handled by the lexState.
          // throw invalidToken()
      },

      afterArrayValue: function afterArrayValue () {
          // This code is unreachable since it's handled by the lexState.
          // if (token.type !== 'punctuator') {
          //     throw invalidToken()
          // }

          if (token.type === 'eof') {
              throw invalidEOF()
          }

          switch (token.value) {
          case ',':
              parseState = 'beforeArrayValue';
              return

          case ']':
              pop();
          }

          // This code is unreachable since it's handled by the lexState.
          // throw invalidToken()
      },

      end: function end () {
          // This code is unreachable since it's handled by the lexState.
          // if (token.type !== 'eof') {
          //     throw invalidToken()
          // }
      },
  };

  function push () {
      var value;

      switch (token.type) {
      case 'punctuator':
          switch (token.value) {
          case '{':
              value = {};
              break

          case '[':
              value = [];
              break
          }

          break

      case 'null':
      case 'boolean':
      case 'numeric':
      case 'string':
          value = token.value;
          break

      // This code is unreachable.
      // default:
      //     throw invalidToken()
      }

      if (root === undefined) {
          root = value;
      } else {
          var parent = stack[stack.length - 1];
          if (Array.isArray(parent)) {
              parent.push(value);
          } else {
              parent[key] = value;
          }
      }

      if (value !== null && typeof value === 'object') {
          stack.push(value);

          if (Array.isArray(value)) {
              parseState = 'beforeArrayValue';
          } else {
              parseState = 'beforePropertyName';
          }
      } else {
          var current = stack[stack.length - 1];
          if (current == null) {
              parseState = 'end';
          } else if (Array.isArray(current)) {
              parseState = 'afterArrayValue';
          } else {
              parseState = 'afterPropertyValue';
          }
      }
  }

  function pop () {
      stack.pop();

      var current = stack[stack.length - 1];
      if (current == null) {
          parseState = 'end';
      } else if (Array.isArray(current)) {
          parseState = 'afterArrayValue';
      } else {
          parseState = 'afterPropertyValue';
      }
  }

  // This code is unreachable.
  // function invalidParseState () {
  //     return new Error(`JSON5: invalid parse state '${parseState}'`)
  // }

  // This code is unreachable.
  // function invalidLexState (state) {
  //     return new Error(`JSON5: invalid lex state '${state}'`)
  // }

  function invalidChar (c) {
      if (c === undefined) {
          return syntaxError(("JSON5: invalid end of input at " + line + ":" + column))
      }

      return syntaxError(("JSON5: invalid character '" + (formatChar(c)) + "' at " + line + ":" + column))
  }

  function invalidEOF () {
      return syntaxError(("JSON5: invalid end of input at " + line + ":" + column))
  }

  // This code is unreachable.
  // function invalidToken () {
  //     if (token.type === 'eof') {
  //         return syntaxError(`JSON5: invalid end of input at ${line}:${column}`)
  //     }

  //     const c = String.fromCodePoint(token.value.codePointAt(0))
  //     return syntaxError(`JSON5: invalid character '${formatChar(c)}' at ${line}:${column}`)
  // }

  function invalidIdentifier () {
      column -= 5;
      return syntaxError(("JSON5: invalid identifier character at " + line + ":" + column))
  }

  function separatorChar (c) {
      console.warn(("JSON5: '" + (formatChar(c)) + "' in strings is not valid ECMAScript; consider escaping"));
  }

  function formatChar (c) {
      var replacements = {
          "'": "\\'",
          '"': '\\"',
          '\\': '\\\\',
          '\b': '\\b',
          '\f': '\\f',
          '\n': '\\n',
          '\r': '\\r',
          '\t': '\\t',
          '\v': '\\v',
          '\0': '\\0',
          '\u2028': '\\u2028',
          '\u2029': '\\u2029',
      };

      if (replacements[c]) {
          return replacements[c]
      }

      if (c < ' ') {
          var hexString = c.charCodeAt(0).toString(16);
          return '\\x' + ('00' + hexString).substring(hexString.length)
      }

      return c
  }

  function syntaxError (message) {
      var err = new SyntaxError(message);
      err.lineNumber = line;
      err.columnNumber = column;
      return err
  }

  var stringify = function stringify (value, replacer, space, circularRefHandler) {
      var stack = [];
      var keyStack = [];
      var indent = '';
      var propertyList;
      var replacerFunc;
      var gap = '';
      var quote;

      // check if `replacer` is really an `options` object instead
      // and take the arguments from there if it is.
      if (
          replacer != null &&
          typeof replacer === 'object' &&
          !Array.isArray(replacer)
      ) {
          space = replacer.space;
          quote = replacer.quote;
          circularRefHandler = replacer.circularRefHandler;
          replacer = replacer.replacer;
      }

      if (typeof replacer === 'function') {
          replacerFunc = replacer;
      } else if (Array.isArray(replacer)) {
          propertyList = [];
          for (var i = 0, list = replacer; i < list.length; i += 1) {
              var v = list[i];

              var item = (void 0);

              if (typeof v === 'string') {
                  item = v;
              } else if (
                  typeof v === 'number' ||
                  v instanceof String ||
                  v instanceof Number
              ) {
                  item = String(v);
              }

              if (item !== undefined && propertyList.indexOf(item) < 0) {
                  propertyList.push(item);
              }
          }
      }

      if (space instanceof Number) {
          space = Number(space);
      } else if (space instanceof String) {
          space = String(space);
      }

      if (typeof space === 'number') {
          if (space > 0) {
              space = Math.min(10, Math.floor(space));
              gap = '          '.substr(0, space);
          }
      } else if (typeof space === 'string') {
          gap = space.substr(0, 10);
      }

      return serializeProperty('', {'': value})

      function serializeProperty (key, holder) {
          var value = holder[key];
          if (value != null) {
              if (typeof value.toJSON5 === 'function') {
                  value = value.toJSON5(key);
              } else if (typeof value.toJSON === 'function') {
                  value = value.toJSON(key);
              }
          }

          if (replacerFunc) {
              value = replacerFunc.call(holder, key, value);
          }

          if (value instanceof Number) {
              value = Number(value);
          } else if (value instanceof String) {
              value = String(value);
          } else if (value instanceof Boolean) {
              value = value.valueOf();
          }

          switch (value) {
          case null: return 'null'
          case true: return 'true'
          case false: return 'false'
          }

          if (typeof value === 'string') {
              return quoteStringES6(value)
          }

          if (typeof value === 'number') {
              return String(value)
          }

          if (typeof value === 'object') {
              if (value instanceof Error) {
                  var ex = {
                      message: value.message,
                      // stack: value.stack,
                      name: value.name,
                  };
                  var exKeys = Object.keys(value);
                  for (var i = 0, list = exKeys; i < list.length; i += 1) {
                      var exKey = list[i];

                      ex[exKey] = value[exKey];
                  }
                  value = ex;
              } else if (value instanceof RegExp) {
                  var re = {
                      re: String(value),
                      source: value.source,
                      flags: value.flags,
                  };
                  var exKeys$1 = Object.keys(value);
                  for (var i$1 = 0, list$1 = exKeys$1; i$1 < list$1.length; i$1 += 1) {
                      var exKey$1 = list$1[i$1];

                      re[exKey$1] = value[exKey$1];
                  }
                  value = re;
              }

              var circusPos = stack.indexOf(value);
              if (circusPos >= 0) {
                  var err = new TypeError('converting circular structure to JSON5');
                  if (typeof circularRefHandler === 'function') {
                      // The user callback MAY introduce another circular ref (unwanted) to serialize:
                      // we cope with it by temporarily switching out the callback, while we
                      // serialize the produce.
                      var newValue = circularRefHandler(value, circusPos, stack.slice(0) /* snapshot */, keyStack.slice(0) /* snapshot */, key, err);
                      var oldF = circularRefHandler;
                      circularRefHandler = function (value, circusPos, stack, keyStack, key, err) { return '[!circular ref inside circularRefHandler!]'; };
                      var rv = serializeProperty('', {'': newValue});
                      circularRefHandler = oldF;
                      return rv
                  } else {
                      throw err
                  }
              }

              return Array.isArray(value) ? serializeArray(value, key) : serializeObject(value, key)
          }

          return undefined
      }

      function quoteStringES6 (value) {
          // When a string contains multiline content, consider printing it as
          // an ES6 template string instead.
          // Ditto for strings with lots of characters which require escaping.
          var eolRe = /[\r\n]/g;
          var regularReplacementsRe = /['"]/g;
          // NOTE: we are intentionally inaccurate with the regexes
          // here as these only serve as heauristics assistants and we do not want
          // to skew preference for ES6style output for strings which array a lot
          // of \x00-\x1f characters besides CR/LF as those strings would be formatted
          // to a *shorter* string in the classic JSON5 string format!
          var es6ReplacementHeuristicRe = /[`]/g;
          var es6ReplacementRe = /[\\`\x00-\x08\x0b\x0c\x0e-\x1f\u2028\u2029]/g; // eslint-disable-line no-control-regex
          // table of character substitutions
          var metaES6 = {
              '\b': '\\b', // \b = U+0008
              '\f': '\\f', // \f = U+000C
              '\v': '\\v', // \v = U+000B
              '`': '\\`',
              '\\': '\\\\',
          };

          // apply heuristic to the decision:
          var es6style = false;
          var l1 = value.split(eolRe);
          var l2 = value.split(regularReplacementsRe);
          var l3 = value.split(es6ReplacementHeuristicRe);

          es6style = (l1.length >= 3);
          if (!es6style) {
              es6style = (l3.length < l2.length - 2);
          }
          if (!es6style) {
              return quoteString(value)
          }
          return '`' + value.replace(es6ReplacementRe, function (a) {
              var c = metaES6[a];
              return typeof c === 'string'
                  ? c
                  : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4)
          }) + '`'
      }

      function quoteString (value) {
          var quotes = {
              "'": 0.1,
              '"': 0.2,
          };

          var replacements = {
              "'": "\\'",
              '"': '\\"',
              '\\': '\\\\',
              '\b': '\\b',
              '\f': '\\f',
              '\n': '\\n',
              '\r': '\\r',
              '\t': '\\t',
              '\v': '\\v',
              '\0': '\\0',
              '\u2028': '\\u2028',
              '\u2029': '\\u2029',
          };

          var product = '';

          for (var i = 0, list = value; i < list.length; i += 1) {
              var c = list[i];

              switch (c) {
              case "'":
              case '"':
                  quotes[c]++;
                  product += c;
                  continue
              }

              if (replacements[c]) {
                  product += replacements[c];
                  continue
              }

              if (c < ' ') {
                  var hexString = c.charCodeAt(0).toString(16);
                  product += '\\x' + ('00' + hexString).substring(hexString.length);
                  continue
              }

              product += c;
          }

          var quoteChar = quote || Object.keys(quotes).reduce(function (a, b) { return (quotes[a] < quotes[b]) ? a : b; });

          product = product.replace(new RegExp(quoteChar, 'g'), replacements[quoteChar]);

          return quoteChar + product + quoteChar
      }

      function serializeObject (value, key) {
          stack.push(value);
          keyStack.push(key);

          var stepback = indent;
          indent = indent + gap;

          var keys = propertyList || Object.keys(value);
          var partial = [];
          for (var i = 0, list = keys; i < list.length; i += 1) {
              var key$1 = list[i];

              var propertyString = serializeProperty(key$1, value);
              if (propertyString !== undefined) {
                  var member = serializeKey(key$1) + ':';
                  if (gap !== '') {
                      member += ' ';
                  }
                  member += propertyString;
                  partial.push(member);
              }
          }

          var final;
          if (partial.length === 0) {
              final = '{}';
          } else {
              var properties;
              if (gap === '') {
                  properties = partial.join(',');
                  final = '{' + properties + '}';
              } else {
                  var separator = ',\n' + indent;
                  properties = partial.join(separator);
                  final = '{\n' + indent + properties + ',\n' + stepback + '}';
              }
          }

          keyStack.pop();
          stack.pop();
          indent = stepback;
          return final
      }

      function serializeKey (key) {
          if (key.length === 0) {
              return quoteString(key, true)
          }

          var firstChar = String.fromCodePoint(key.codePointAt(0));
          if (!util.isIdStartChar(firstChar)) {
              return quoteString(key, true)
          }

          for (var i = firstChar.length; i < key.length; i++) {
              if (!util.isIdContinueChar(String.fromCodePoint(key.codePointAt(i)))) {
                  return quoteString(key, true)
              }
          }

          return key
      }

      function serializeArray (value, key) {
          stack.push(value);
          keyStack.push(key);

          var stepback = indent;
          indent = indent + gap;

          var partial = [];
          for (var i = 0; i < value.length; i++) {
              var propertyString = serializeProperty(String(i), value);
              partial.push((propertyString !== undefined) ? propertyString : 'null');
          }

          var final;
          if (partial.length === 0) {
              final = '[]';
          } else {
              if (gap === '') {
                  var properties = partial.join(',');
                  final = '[' + properties + ']';
              } else {
                  var separator = ',\n' + indent;
                  var properties$1 = partial.join(separator);
                  final = '[\n' + indent + properties$1 + ',\n' + stepback + ']';
              }
          }

          keyStack.pop();
          stack.pop();
          indent = stepback;
          return final
      }
  };

  var JSON5 = {
      parse: parse,
      stringify: stringify,
  };

  var lib = JSON5;

  var es5 = lib;

  return es5;

}));
