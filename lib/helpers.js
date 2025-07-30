(function() {
  'use strict';
  var FS, GUY, LFT, PATH, alert, debug, def, def_oneoff, echo, help, hide, info, inspect, log, plain, praise, rpr, shm_path, urge, warn, whisper;

  //###########################################################################################################
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('DBAY/HELPERS'));

  ({rpr, inspect, echo, log} = GUY.trm);

  //...........................................................................................................
  PATH = require('path');

  FS = require('fs');

  shm_path = '/dev/shm';

  LFT = require('letsfreezethat');

  //-----------------------------------------------------------------------------------------------------------
  this.is_directory = function(path) {
    var error;
    try {
      return (FS.statSync(path)).isDirectory();
    } catch (error1) {
      error = error1;
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
    return false;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.is_file = function(path) {
    var error;
    try {
      return (FS.statSync(path)).isFile();
    } catch (error1) {
      error = error1;
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
    return false;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.unlink_file = function(path) {
    var error;
    try {
      /* Given a `path`, unlink the associated file; in case no file is found, ignore silently. If an error
       occurs, just print a warning. To be used in an exit handler, so no error handling makes sense here. */
      FS.unlinkSync(path);
    } catch (error1) {
      error = error1;
      if (error.code !== 'ENOENT') {
        warn('^dbay@1^', error.message);
      }
    }
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.autolocation = this.is_directory(shm_path) ? shm_path : (require('os')).tmpdir();

  //-----------------------------------------------------------------------------------------------------------
  this.SQL = function(parts, ...expressions) {
    var R, expression, i, idx, len;
    R = parts[0];
    for (idx = i = 0, len = expressions.length; i < len; idx = ++i) {
      expression = expressions[idx];
      R += expression.toString() + parts[idx + 1];
    }
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.omit_nullish = function(d) {
    var R, k, v;
    R = {};
    for (k in d) {
      v = d[k];
      if (v != null) {
        R[k] = v;
      }
    }
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.def = def = Object.defineProperty;

  this.hide = hide = (object, name, value) => {
    return Object.defineProperty(object, name, {
      enumerable: false,
      writable: true,
      configurable: true,
      value: value
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this._pick_with_fallback = function(d, fallback, ...keys) {
    var R, i, key, len, value;
    R = {};
    keys = keys.flat(2e308);
    for (i = 0, len = keys.length; i < len; i++) {
      key = keys[i];
      R[key] = (value = d[key]) === void 0 ? fallback : value;
    }
    return [R, keys];
  };

  //-----------------------------------------------------------------------------------------------------------
  this.pick_with_fallback = function(d, fallback, ...keys) {
    return (this._pick_with_fallback(d, fallback, keys))[0];
  };

  //-----------------------------------------------------------------------------------------------------------
  this.pluck_with_fallback = function(d, fallback, ...keys) {
    var R, i, key, len;
    [R, keys] = this._pick_with_fallback(d, fallback, ...keys);
    for (i = 0, len = keys.length; i < len; i++) {
      key = keys[i];
      delete d[key];
    }
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.def_oneoff = def_oneoff = (object, name, cfg, method) => {
    var get;
    get = function() {
      var R, ref, ref1;
      R = method.apply(object);
      delete cfg.get;
      def(object, name, {
        configurable: (ref = cfg.configurable) != null ? ref : true,
        enumerable: (ref1 = cfg.enumerable) != null ? ref1 : true,
        value: R
      });
      return R;
    };
    def(object, name, {
      enumerable: true,
      configurable: true,
      get
    });
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.configure_with_types = (self, cfg = null, types = null) => {
    var clasz, defaults, props, ref, ref1, ref2;
    ({props} = require('..'));
    clasz = self.constructor;
    //.........................................................................................................
    /* assign defaults object where to be found to obtain viable `cfg` object: */
    defaults = (ref = (ref1 = clasz.C) != null ? (ref2 = ref1.defaults) != null ? ref2.constructor_cfg : void 0 : void 0) != null ? ref : null;
    self.cfg = {...defaults, ...cfg};
    //.........................................................................................................
    /* procure `types` where not given; make it a non-enumerable to avoid rpr of object: */
    if (types == null) {
      types = new (require('intertype')).Intertype();
    }
    this.def(self, 'types', {
      enumerable: false,
      value: types
    });
    if (clasz.declare_types != null) {
      //.........................................................................................................
      /* call class method `declare_types()`; this method may perform `self.types.validate.constructor_cfg self.cfg`: */
      clasz.declare_types(self);
    }
    self.cfg = LFT.freeze(self.cfg);
    return void 0;
  };

}).call(this);

//# sourceMappingURL=helpers.js.map