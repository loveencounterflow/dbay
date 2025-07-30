(function() {
  'use strict';
  var GUY, LFT, alert, debug, echo, guy, help, info, inspect, log, plain, praise, rpr, types, urge, warn, whisper;

  //###########################################################################################################
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('DBAY/RANDOM'));

  ({rpr, inspect, echo, log} = GUY.trm);

  //...........................................................................................................
  guy = require('guy');

  types = new (require('intertype')).Intertype();

  LFT = require('letsfreezethat');

  //===========================================================================================================
  types.declare('constructor_cfg', {
    tests: {
      "@isa.object x": function(x) {
        return this.isa.object(x);
      },
      "x.seed may be a float within certain boundaries": function(x) {
        var ref;
        if (x.seed == null) {
          return true;
        }
        if (!this.isa.float(x.seed)) {
          return false;
        }
        return (-1e10 < (ref = x.seed) && ref < +1e10);
      },
      "x.delta may be a float within certain boundaries": function(x) {
        var ref;
        if (x.delta == null) {
          return true;
        }
        if (!this.isa.float(x.delta)) {
          return false;
        }
        if (!((Math.abs(x.delta)) > 1e-3)) {
          return false;
        }
        return (-1e10 < (ref = x.delta) && ref < +1e10);
      }
    }
  });

  //===========================================================================================================
  // RANDOM NUMBER GENERATION
  // seedable for testing purposes
  //-----------------------------------------------------------------------------------------------------------
  this.Random = (function() {
    class Random {
      //=========================================================================================================
      constructor(cfg) {
        var delta, ref, ref1, seed;
        this.cfg = LFT.freeze({...this.constructor.C.defaults.constructor_cfg, ...cfg});
        types.validate.constructor_cfg(this.cfg);
        if ((this.cfg.seed != null) || (this.cfg.delta != null)) {
          seed = (ref = this.cfg.seed) != null ? ref : 12.34;
          delta = (ref1 = this.cfg.delta) != null ? ref1 : 1;
          this.get_random_integer = GUY.rnd.get_rnd_int(seed, delta);
        } else {
          this.get_random_integer = GUY.rnd.random_integer.bind(GUY.rnd);
        }
        return void 0;
      }

      //---------------------------------------------------------------------------------------------------------
      get_random_filename(extension = 'sqlite') {
        var n10;
        n10 = this.get_random_integer(1_000_000_000, 9_999_999_999);
        return `dbay-${n10}.${extension}`;
      }

    };

    //---------------------------------------------------------------------------------------------------------
    Random.C = LFT.freeze({
      defaults: {
        //.....................................................................................................
        constructor_cfg: {
          seed: null,
          delta: null
        }
      }
    });

    return Random;

  }).call(this);

}).call(this);

//# sourceMappingURL=random.js.map