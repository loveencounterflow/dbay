(function() {
  'use strict';
  var E, GUY, alert, debug, echo, help, info, inspect, log, plain, praise, rpr, urge, warn, whisper,
    boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

  //###########################################################################################################
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('DBAY/QUERY'));

  ({rpr, inspect, echo, log} = GUY.trm);

  //...........................................................................................................
  E = require('./errors');

  //===========================================================================================================
  this.DBay_query = (clasz = Object) => {
    var _class;
    return _class = class extends clasz {
      constructor() {
        super(...arguments);
        //---------------------------------------------------------------------------------------------------------
        this.do = this.do.bind(this);
      }

      //---------------------------------------------------------------------------------------------------------
      _$query_initialize() {
        GUY.props.def(this._me, '_statements', {
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

      do(first, ...P) {
        var statement, type;
        boundMethodCheck(this, _class);
        switch ((type = this.types.type_of(first))) {
          case 'text':
            return this._query_run_or_execute(first, ...P);
          case 'object':
          case 'function':
            return this.with_transaction(first, ...P);
          case 'statement':
            statement = first;
            if (statement.reader) {
              return statement.iterate(...P);
            } else {
              return statement.run(...P);
            }
        }
        throw new E.DBay_wrong_type('^dbay/query@1^', 'a text, an object, or a function', type);
      }

      //---------------------------------------------------------------------------------------------------------
      _query_run_or_execute(sql, ...P) {
        var error, statement;
        if (P.length > 0) {
          return this.query(sql, ...P);
        }
        if (this._statements[sql] === this.constructor.C.symbols.execute) {
          return this.execute(sql, ...P);
        }
        try {
          statement = this.prepare(sql);
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
        var statement;
        statement = this.types.isa.statement(sql) ? sql : this.prepare(sql);
        if (statement.reader) {
          return statement.iterate(...P);
        } else {
          return statement.run(...P);
        }
      }

      //---------------------------------------------------------------------------------------------------------
      walk(sql, ...P) {
        var statement;
        statement = this.types.isa.statement(sql) ? sql : this.prepare(sql);
        return statement.iterate(...P);
      }

      //---------------------------------------------------------------------------------------------------------
      all_rows(sql, ...P) {
        var statement;
        statement = this.types.isa.statement(sql) ? sql : this.prepare(sql);
        return statement.all(...P);
      }

      //---------------------------------------------------------------------------------------------------------
      as_object(key, sql, ...P) {
        var R, d, ref;
        this.types.validate.nonempty_text(key);
        R = {};
        ref = this.query(sql);
        for (d of ref) {
          R[d[key]] = d;
          delete d[key];
        }
        return R;
      }

      //---------------------------------------------------------------------------------------------------------
      first_row(sql, ...P) {
        var ref;
        return (ref = (this.all_rows(sql, ...P))[0]) != null ? ref : null;
      }

      //---------------------------------------------------------------------------------------------------------
      * first_values(sql, ...P) {
        var key, ref, row, value;
        ref = this.walk(sql, ...P);
        for (row of ref) {
          for (key in row) {
            value = row[key];
            yield value;
            break;
          }
        }
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      all_first_values(sql, ...P) {
        return [...(this.first_values(sql, ...P))];
      }

      //---------------------------------------------------------------------------------------------------------
      single_row(sql, ...P) {
        var rows;
        if ((rows = this.all_rows(sql, ...P)).length !== 1) {
          throw new E.DBay_expected_single_row('^dbay/query@2^', rows.length);
        }
        return rows[0];
      }

      //---------------------------------------------------------------------------------------------------------
      single_value(sql, ...P) {
        var keys, row;
        row = this.single_row(sql, ...P);
        if ((keys = Object.keys(row)).length !== 1) {
          throw new E.DBay_expected_single_value('^dbay/query@4^', keys);
        }
        return row[keys[0]];
      }

      //---------------------------------------------------------------------------------------------------------
      execute(sql, ...P) {
        if (P.length > 0) {
          throw new E.DBay_argument_not_allowed('^dbay/query@5^', "extra", rpr(P));
        }
        this.sqlt1.exec(sql);
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      execute_file(cfg) {
        this.types.validate.dbay_execute_file_cfg((cfg = {...this.constructor.C.defaults.dbay_execute_file_cfg, ...cfg}));
        return this.execute((require('fs')).readFileSync(cfg.path, {
          encoding: cfg.encoding
        }));
      }

      //---------------------------------------------------------------------------------------------------------
      prepare(sql) {
        var base;
        if (this.cfg.macros) {
          sql = this.macros.resolve(sql);
        }
        return ((base = this._statements)[sql] != null ? base[sql] : base[sql] = this.sqlt1.prepare(sql));
      }

      //---------------------------------------------------------------------------------------------------------
      pragma(...P) {
        return this.sqlt1.pragma(...P);
      }

    };
  };

}).call(this);

//# sourceMappingURL=query-mixin.js.map