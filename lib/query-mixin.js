(function() {
  'use strict';
  var CND, E, badge, debug, guy, rpr;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'DBAY/MIXIN/QUERY';

  debug = CND.get_logger('debug', badge);

  //...........................................................................................................
  guy = require('guy');

  E = require('./errors');

  //===========================================================================================================
  this.Dbay_query = (clasz = Object) => {
    return class extends clasz {
      //---------------------------------------------------------------------------------------------------------
      constructor() {
        super();
        guy.props.def(this, '_statements', {
          enumerable: false,
          value: {}
        });
        return void 0;
      }

      //---------------------------------------------------------------------------------------------------------
      _clear_statements_cache() {
        var k;
        for (k in this._statements) {
          delete this._statements[k];
        }
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      query(sql, ...P) {
        var base, statement;
        // @_echo 'query', sql
        statement = ((base = this._statements)[sql] != null ? base[sql] : base[sql] = this.sqlt1.prepare(sql));
        if (statement.reader) {
          return statement.iterate(...P);
        } else {
          return statement.run(...P);
        }
      }

      //---------------------------------------------------------------------------------------------------------
      execute(sql, ...P) {
        if (P.length > 0) {
          throw new E.Dbay_argument_not_allowed('^dba@308^', "extra", rpr(P));
        }
        // @_echo 'execute', sql
        this.sqlt1.exec(sql);
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      prepare(sql) {
        var base;
        // @_echo 'prepare', sql
        return ((base = this._statements)[sql] != null ? base[sql] : base[sql] = this.sqlt1.prepare(sql));
      }

    };
  };

}).call(this);

//# sourceMappingURL=query-mixin.js.map