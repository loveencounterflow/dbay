(function() {
  'use strict';
  var E, GUY, Sql, alert, debug, declare, echo, help, info, inspect, isa, log, plain, praise, rpr, size_of, type_of, types, urge, validate, validate_optional, warn, whisper;

  //###########################################################################################################
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('DBAY/SQL'));

  ({rpr, inspect, echo, log} = GUY.trm);

  types = require('./types');

  ({isa, validate, validate_optional, declare, size_of, type_of} = types);

  E = require('./errors');

  GUY = require('guy');

  Sql = (function() {
    //===========================================================================================================
    class Sql {
      constructor() {
        //---------------------------------------------------------------------------------------------------------
        this.I = this.I.bind(this);
        //---------------------------------------------------------------------------------------------------------
        this.L = this.L.bind(this);
        //---------------------------------------------------------------------------------------------------------
        this.V = this.V.bind(this);
        //---------------------------------------------------------------------------------------------------------
        this.interpolate = this.interpolate.bind(this);
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

    };

    //---------------------------------------------------------------------------------------------------------
    Sql.prototype.SQL = String.raw;

    Sql.prototype._interpolation_pattern = /(?<opener>[$?])(?<format>.?):(?<name>\w*)/g;

    return Sql;

  }).call(this);

  //###########################################################################################################
  module.exports = {
    sql: new Sql()
  };

}).call(this);

//# sourceMappingURL=sql.js.map