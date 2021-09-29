(function() {
  'use strict';
  var CND, badge, debug, guy, rpr;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'DBAY/MIXIN/QUERY';

  debug = CND.get_logger('debug', badge);

  //...........................................................................................................
  guy = require('guy');

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
        var base, returns_data, statement;
        // @_echo 'query', sql
        statement = ((base = this._statements)[sql] != null ? base[sql] : base[sql] = this.sqlt.prepare(sql));
        returns_data = statement.reader;
        return debug('^0048560^', returns_data);
      }

      // return statement.iterate P...

        // #---------------------------------------------------------------------------------------------------------
      // run: ( sql, P... ) ->
      //   @_echo 'run', sql
      //   statement = ( @_statements[ sql ] ?= @sqlt.prepare sql )
      //   return statement.run P...

        //---------------------------------------------------------------------------------------------------------
      execute(sql) {
        var x;
        if ((x = arguments[1]) != null) {
          throw new E.Dba_argument_not_allowed('^dba@308^', "extra", rpr(x));
        }
        // @_echo 'execute', sql
        return this.sqlt1.exec(sql);
      }

      //---------------------------------------------------------------------------------------------------------
      prepare(sql) {
        // @_echo 'prepare', sql
        return this.sqlt1.prepare(sql);
      }

    };
  };

}).call(this);

//# sourceMappingURL=query-mixin.js.map