(function() {
  'use strict';
  var CND, E, SQL, badge, debug, guy, rpr;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'DBAY/MIXIN/OPEN-CLOSE';

  debug = CND.get_logger('debug', badge);

  //...........................................................................................................
  guy = require('guy');

  E = require('./errors');

  SQL = String.raw;

  //===========================================================================================================
  this.DBay_openclose = (clasz = Object) => {
    return class extends clasz {
      //---------------------------------------------------------------------------------------------------------
      open(cfg) {
        var path, schema, temporary;
        cfg = {...cfg};
        // cfg.temporary  ?= if cfg.path? then false else true
        this.constructor.cast_constructor_cfg(this, cfg);
        this.types.validate.dbay_open_cfg(cfg);
        ({path, schema, temporary} = cfg);
        this._attach(schema, path, temporary);
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _attach(schema, path, temporary) {
        var error;
        try {
          /* Execute SQL"attach $path as $schema". This will fail if
               * `schema` already exists, or
               * the maximum number of schemas (125) has already been attached, or
               * the schema name is `main` or `temp`.
              */
          //.......................................................................................................
          (this.sqlt1.prepare(SQL`attach ? as ?;`)).run([path, schema]);
        } catch (error1) {
          error = error1;
          if (error.code !== 'SQLITE_ERROR') {
            throw error;
          }
          if (error.message.startsWith('too many attached databases')) {
            throw new E.DBay_sqlite_too_many_dbs('^dba@313^', schema);
          }
          throw new E.DBay_sqlite_error('^dba@314^', error);
        }
        this._register_schema(schema, path, temporary);
        return null;
      }

    };
  };

}).call(this);

//# sourceMappingURL=open-close-mixin.js.map