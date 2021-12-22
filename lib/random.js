(function() {
  'use strict';
  var CND, badge, debug, guy, rpr, types;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'DBAY/MIXIN/RANDOM';

  debug = CND.get_logger('debug', badge);

  //...........................................................................................................
  guy = require('guy');

  types = new (require('intertype')).Intertype();

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
        this.cfg = guy.lft.freeze({...this.constructor.C.defaults.constructor_cfg, ...cfg});
        types.validate.constructor_cfg(this.cfg);
        if ((this.cfg.seed != null) || (this.cfg.delta != null)) {
          seed = (ref = this.cfg.seed) != null ? ref : 12.34;
          delta = (ref1 = this.cfg.delta) != null ? ref1 : 1;
          this.get_random_integer = CND.get_rnd_int(seed, delta);
        } else {
          this.get_random_integer = CND.random_integer.bind(CND);
        }
        return void 0;
      }

      //---------------------------------------------------------------------------------------------------------
      get_random_filename() {
        var n10;
        n10 = this.get_random_integer(1_000_000_000, 9_999_999_999);
        return `dbay-${n10}.sqlite`;
      }

    };

    //---------------------------------------------------------------------------------------------------------
    Random.C = guy.lft.freeze({
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