(function() {
  'use strict';
  var CND, E, badge, debug, guy, rpr;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'DBAY/MIXIN/OPEN-CLOSE';

  debug = CND.get_logger('debug', badge);

  //...........................................................................................................
  guy = require('guy');

  E = require('./errors');

  //===========================================================================================================
  this.Dbay_openclose = (clasz = Object) => {
    return class extends clasz {
      //---------------------------------------------------------------------------------------------------------
      open(cfg) {
        var path, ram, saveas, schema;
        cfg = {...cfg};
        if (cfg.temporary == null) {
          cfg.temporary = cfg.path != null ? false : true;
        }
        this.types.validate.dbay_open_cfg((cfg = {...this.types.defaults.dbay_open_cfg, ...cfg}));
        ({path, schema, ram} = cfg);
        //.......................................................................................................
        /* TAINT troublesome logic with `path` and `saveas` */
        if (path != null) {
          saveas = path;
        } else {
          path = ''/* TAINT or ':memory:' depending on `cfg.disk` */
          saveas = null;
        }
        //.......................................................................................................
        if (ram) {
          this._open_file_db_in_ram({path, schema, saveas});
        } else {
          this._attach({path, schema, saveas});
        }
        //.......................................................................................................
        return null;
      }

    };
  };

}).call(this);

//# sourceMappingURL=open-close-mixin.js.map