(function() {
  'use strict';
  var CND, DBay_sqlx, E, GUY, badge, debug, declare, echo, help, info, isa, rpr, size_of, type_of, types, urge, validate, validate_optional, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'DBAY/SQL';

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  info = CND.get_logger('info', badge);

  urge = CND.get_logger('urge', badge);

  help = CND.get_logger('help', badge);

  whisper = CND.get_logger('whisper', badge);

  echo = CND.echo.bind(CND);

  types = require('./types');

  ({isa, validate, validate_optional, declare, size_of, type_of} = types);

  E = require('./errors');

  GUY = require('guy');

  ({DBay_sqlx} = require('dbay-sql-macros'));

  //===========================================================================================================
  this.Sql = (function() {
    class Sql {
      //---------------------------------------------------------------------------------------------------------
      constructor(hub) {
        //---------------------------------------------------------------------------------------------------------
        this.I = this.I.bind(this);
        //---------------------------------------------------------------------------------------------------------
        this.L = this.L.bind(this);
        //---------------------------------------------------------------------------------------------------------
        this.V = this.V.bind(this);
        //---------------------------------------------------------------------------------------------------------
        this.interpolate = this.interpolate.bind(this);
        //---------------------------------------------------------------------------------------------------------
        this.declare = this.declare.bind(this);
        this.resolve = this.resolve.bind(this);
        GUY.props.hide(this, 'hub', hub);
        GUY.props.hide(this, 'macros', new DBay_sqlx());
        return void 0;
      }

      I(name) {
        return '"' + (name.replace(/"/g, '""')) + '"';
      }

      L(x) {
        var type;
        if (x == null) {
          return 'null';
        }
        switch (type = type_of(x)) {
          case 'text':
            return "'" + (x.replace(/'/g, "''")) + "'";
          // when 'list'       then return "'#{@list_as_json x}'"
          case 'float':
            return x.toString();
          case 'boolean':
            return (x ? '1' : '0');
        }
        // when 'list'       then throw new Error "^dba@23^ use `X()` for lists"
        throw new E.DBay_sql_value_error('^dbay/sql@1^', type, x);
      }

      V(x) {
        var e, type;
        if ((type = type_of(x)) !== 'list') {
          throw new E.DBay_sql_not_a_list_error('^dbay/sql@2^', type, x);
        }
        return '( ' + (((function() {
          var i, len, results;
          results = [];
          for (i = 0, len = x.length; i < len; i++) {
            e = x[i];
            results.push(this.L(e));
          }
          return results;
        }).call(this)).join(', ')) + ' )';
      }

      interpolate(sql, values) {
        var idx;
        idx = -1;
        return sql.replace(this._interpolation_pattern, ($0, opener, format, name) => {
          var key, value;
          idx++;
          switch (opener) {
            case '$':
              validate.nonempty_text(name);
              key = name;
              break;
            case '?':
              key = idx;
          }
          value = values[key];
          switch (format) {
            case '':
            case 'I':
              return this.I(value);
            case 'L':
              return this.L(value);
            case 'V':
              return this.V(value);
          }
          throw new E.DBay_interpolation_format_unknown('^dbay/sql@3^', format);
        });
      }

      declare(...P) {
        return this.macros.declare(...P);
      }

      resolve(...P) {
        return this.macros.resolve(...P);
      }

    };

    //---------------------------------------------------------------------------------------------------------
    Sql.prototype.SQL = String.raw;

    Sql.prototype._interpolation_pattern = /(?<opener>[$?])(?<format>.?):(?<name>\w*)/g;

    return Sql;

  }).call(this);

}).call(this);

//# sourceMappingURL=sql.js.map