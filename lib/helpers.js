(function() {
  'use strict';
  var CND, FS, PATH, badge, debug, echo, guy, help, info, rpr, shm_path, urge, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'DBAY/MAIN';

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  info = CND.get_logger('info', badge);

  urge = CND.get_logger('urge', badge);

  help = CND.get_logger('help', badge);

  whisper = CND.get_logger('whisper', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  PATH = require('path');

  FS = require('fs');

  shm_path = '/dev/shm';

  guy = require('guy');

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
  this.autolocation = this.is_directory(shm_path) ? shm_path : (require('os')).tmpdir();

  //===========================================================================================================
  this.Dbay_rnd = (function() {
    class Dbay_rnd {
      _initialize_prng() {
        var clasz, delta, ref, ref1, ref2, ref3, seed;
        clasz = this.constructor;
        if (clasz._rnd_int_cfg != null) {
          seed = (ref = (ref1 = clasz._rnd_int_cfg) != null ? ref1.seed : void 0) != null ? ref : 12.34;
          delta = (ref2 = (ref3 = clasz._rnd_int_cfg) != null ? ref3.delta : void 0) != null ? ref2 : 1;
          guy.props.def(this, '_rnd_int', {
            enumerable: false,
            value: CND.get_rnd_int(seed, delta)
          });
        } else {
          guy.props.def(this, '_rnd_int', {
            enumerable: false,
            value: CND.random_integer.bind(CND)
          });
        }
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _get_random_filename() {
        /* TAINT rename `dbnick` to `dbnick` */
        /* Given an optional `dbnick`, return an object with the `dbnick` and the `url` for a new SQLite
           connection. The url will look like `'file:your_name_here?mode=memory&cache=shared` so multiple
           connections to the same RAM DB can be opened. When `dbnick` is not given, a random dbnick like
           `_icql_6200294332` will be chosen (prefix `_icql_`, suffix ten decimal digits). For testing, setting
           class property `@_rnd_int_cfg` can be used to obtain repeatable series of random names. */
        var n10;
        n10 = this._rnd_int(1_000_000_000, 9_999_999_999);
        return `dbay-${n10}.sqlite`;
      }

      //---------------------------------------------------------------------------------------------------------
      constructor() {
        this._initialize_prng();
      }

    };

    //=========================================================================================================
    // RANDOM NUMBER GENERATION
    // seedable for testing purposes
    //---------------------------------------------------------------------------------------------------------
    /* To obtain a class with a seedable PRNG that emits repeatable sequences, define class property
     `@_rnd_int_cfg: { seed, delta, }` where both seed and delta can be arbitrary finite numbers. **NOTE**
     very small `delta` values (like 1e-10) may cause adjacent numbers to be close together or even repeat. To
     use default values for both parameters, set `@_rnd_int_cfg: true`.*/
    Dbay_rnd._rnd_int_cfg = false;

    return Dbay_rnd;

  }).call(this);

}).call(this);

//# sourceMappingURL=helpers.js.map