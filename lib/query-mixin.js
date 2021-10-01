(function() {
  'use strict';
  var CND, E, badge, debug, guy, rpr,
    boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

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
    var _class;
    return _class = class extends clasz {
      constructor() {
        super(...arguments);
        //---------------------------------------------------------------------------------------------------------
        this.do = this.do.bind(this);
      }

      //---------------------------------------------------------------------------------------------------------
      _$query_initialize() {
        guy.props.def(this._me, '_statements', {
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

      do(sql, ...P) {
        var error, statement;
        boundMethodCheck(this, _class);
        if (P.length > 0) {
          return this.query(sql, ...P);
        }
        if (this._statements[sql] === this.constructor.C.symbols.execute) {
          return this.execute(sql, ...P);
        }
        try {
          statement = this._statements[sql] = this.sqlt1.prepare(sql);
        } catch (error1) {
          error = error1;
          if (!((error.name === 'RangeError') && (error.message === "The supplied SQL string contains more than one statement"))) {
            throw error;
          }
          this._statements[sql] = this.constructor.C.symbols.execute;
          return this.execute(sql, ...P);
        }
        if (statement.reader) {
          return statement.iterate(...P);
        } else {
          return statement.run(...P);
        }
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
          throw new E.Dbay_argument_not_allowed('^dbay/query@308^', "extra", rpr(P));
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