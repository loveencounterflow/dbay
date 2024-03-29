(function() {
  'use strict';
  /* https://day.js.org */
  var E, GUY, alert, dayjs, debug, echo, help, info, inspect, log, plain, praise, rpr, urge, walk_split_parts, warn, whisper;

  //###########################################################################################################
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('DBAY/STDLIB'));

  ({rpr, inspect, echo, log} = GUY.trm);

  E = require('./errors');

  //-----------------------------------------------------------------------------------------------------------
  GUY = require('guy');

  dayjs = require('dayjs');

  (() => {
    var customParseFormat, duration, relativeTime, toObject, utc;
    utc = require('dayjs/plugin/utc');
    dayjs.extend(utc);
    relativeTime = require('dayjs/plugin/relativeTime');
    dayjs.extend(relativeTime);
    toObject = require('dayjs/plugin/toObject');
    dayjs.extend(toObject);
    customParseFormat = require('dayjs/plugin/customParseFormat');
    dayjs.extend(customParseFormat);
    duration = require('dayjs/plugin/duration');
    return dayjs.extend(duration);
  })();

  //-----------------------------------------------------------------------------------------------------------
  walk_split_parts = function*(text, splitter, omit_empty) {
    var count, i, idx, len, lnr, part, parts, rnr;
    parts = text.split(splitter);
    parts = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = parts.length; i < len; i++) {
        part = parts[i];
        if ((!omit_empty) || (part !== '')) {
          results.push(part);
        }
      }
      return results;
    })();
    count = parts.length;
    for (idx = i = 0, len = parts.length; i < len; idx = ++i) {
      part = parts[idx];
      lnr = idx + 1;
      rnr = count - idx;
      yield ({lnr, rnr, part});
    }
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.DBay_stdlib = (clasz = Object) => {
    return class extends clasz {
      /* TAINT use `cfg` */
      //---------------------------------------------------------------------------------------------------------
      _$stdlib_initialize() {
        GUY.props.hide(this._me, '_dayjs', dayjs);
        GUY.props.hide(this._me, '_dt_dbay_timestamp_input_template', 'YYYYMMDD-HHmmssZ');
        GUY.props.hide(this._me, '_dt_dbay_timestamp_output_template', 'YYYYMMDD-HHmmss[Z]');
        this._me._stdlib_created = false;
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      create_stdlib() {
        var prefix;
        if (this._stdlib_created) {
          return null;
        }
        this._stdlib_created = true;
        prefix = 'std_';
        //-------------------------------------------------------------------------------------------------------
        this.create_function({
          name: prefix + 'sql_i',
          deterministic: true,
          varargs: false,
          call: (name) => {
            return this.sql.I(name);
          }
        });
        //-------------------------------------------------------------------------------------------------------
        this.create_function({
          name: prefix + 'str_reverse',
          deterministic: true,
          varargs: false,
          call: function(s) {
            return (Array.from(s)).reverse().join('');
          }
        });
        //-------------------------------------------------------------------------------------------------------
        this.create_function({
          name: prefix + 'str_join',
          deterministic: true,
          varargs: true,
          call: function(joiner, ...P) {
            return P.join(joiner);
          }
        });
        //-------------------------------------------------------------------------------------------------------
        this.create_function({
          name: prefix + 'str_is_blank',
          deterministic: true,
          varargs: false,
          call: function(s) {
            if (/^\s+$/.test(s)) {
              return 1;
            } else {
              return 0;
            }
          }
        });
        //-------------------------------------------------------------------------------------------------------
        this.create_table_function({
          name: prefix + 'str_split',
          columns: ['lnr', 'rnr', 'part'],
          parameters: ['text', 'splitter', 'omit_empty'],
          deterministic: true,
          varargs: false,
          rows: function*(text, splitter, omit_empty = false) {
            omit_empty = !!omit_empty;
            yield* walk_split_parts(text, splitter, omit_empty);
            return null;
          }
        });
        //-------------------------------------------------------------------------------------------------------
        this.create_table_function({
          name: prefix + 'str_split_re',
          columns: ['lnr', 'rnr', 'part'],
          parameters: ['text', 'splitter', 'flags', 'omit_empty'],
          deterministic: false,
          varargs: true,
          rows: function*(text, splitter, flags = null, omit_empty = false) {
            var re;
            omit_empty = !!omit_empty;
            if (flags != null) {
              re = new RegExp(splitter, flags);
            } else {
              re = new RegExp(splitter);
            }
            yield* walk_split_parts(text, re, omit_empty);
            return null;
          }
        });
        //-------------------------------------------------------------------------------------------------------
        this.create_table_function({
          name: prefix + 'str_split_first',
          columns: ['prefix', 'suffix'],
          parameters: ['text', 'splitter'],
          deterministic: true,
          varargs: false,
          rows: function*(text, splitter) {
            var idx;
            if ((text === null) || (splitter === null)) {
              return null;
            }
            if ((idx = text.indexOf(splitter)) < 0) {
              yield [text, null];
            } else {
              yield [text.slice(0, idx), text.slice(idx + 1)];
            }
            return null;
          }
        });
        //-------------------------------------------------------------------------------------------------------
        this.create_table_function({
          name: prefix + 'generate_series',
          columns: ['value'],
          parameters: ['start', 'stop', 'step'],
          varargs: true,
          deterministic: true,
          rows: function*(start, stop = 2e308, step = 1) {
            /* NOTE: `stop` differs from SQLite3, which has 9223372036854775807 */
            var value;
            value = start;
            while (true) {
              if (value > stop) {
                break;
              }
              yield [value];
              value += step;
            }
            return null;
          }
        });
        //-------------------------------------------------------------------------------------------------------
        this.create_table_function({
          name: prefix + 're_matches',
          columns: ['match', 'capture'],
          parameters: ['text', 'pattern'],
          rows: function*(text, pattern) {
            var match, ref, regex;
            regex = new RegExp(pattern, 'g');
            while ((match = regex.exec(text)) != null) {
              yield [match[0], (ref = match[1]) != null ? ref : null];
            }
            return null;
          }
        });
        //-------------------------------------------------------------------------------------------------------
        this.create_function({
          name: prefix + 're_is_match',
          deterministic: false,
          varargs: false,
          call: function(text, pattern) {
            if ((new RegExp(pattern, 'g')).test(text)) {
              return 1;
            } else {
              return 0;
            }
          }
        });
        //=======================================================================================================
        // ASSERTS AND EXCEPTIONS
        //-------------------------------------------------------------------------------------------------------
        this.create_function({
          name: prefix + 'echo',
          deterministic: false,
          varargs: false,
          call: function(message) {
            echo(message);
            return message;
          }
        });
        //-------------------------------------------------------------------------------------------------------
        this.create_function({
          name: prefix + 'debug',
          deterministic: false,
          varargs: false,
          call: function(message) {
            debug(message);
            return message;
          }
        });
        //-------------------------------------------------------------------------------------------------------
        this.create_function({
          name: prefix + 'info',
          deterministic: false,
          varargs: false,
          call: function(message) {
            info(message);
            return message;
          }
        });
        //-------------------------------------------------------------------------------------------------------
        this.create_function({
          name: prefix + 'warn',
          deterministic: false,
          varargs: false,
          call: function(message) {
            warn(message);
            return message;
          }
        });
        //=======================================================================================================
        // ASSERTS AND EXCEPTIONS
        //-------------------------------------------------------------------------------------------------------
        this.create_function({
          name: prefix + 'raise',
          deterministic: true,
          varargs: false,
          call: function(message) {
            throw new Error(message);
          }
        });
        //-------------------------------------------------------------------------------------------------------
        this.create_function({
          name: prefix + 'raise_json',
          deterministic: true,
          varargs: false,
          call: function(facets_json) {
            var error, facets, k, ref, v;
            try {
              facets = JSON.parse(facets_json);
            } catch (error1) {
              error = error1;
              throw new Error(`not a valid argument for std_raise_json: ${rpr(facets)}`);
            }
            error = new Error((ref = facets.message) != null ? ref : "(no error message given)");
            for (k in facets) {
              v = facets[k];
              if (k === 'message') {
                continue;
              }
              error[k] = v;
            }
            throw error;
          }
        });
        //-------------------------------------------------------------------------------------------------------
        this.create_function({
          name: prefix + 'assert',
          deterministic: true,
          varargs: false,
          call: function(test, message) {
            if ((test == null) || (test === 0)) {
              throw new Error(message);
            }
            return test;
          }
        });
        //-------------------------------------------------------------------------------------------------------
        this.create_function({
          name: prefix + 'warn_if',
          deterministic: true,
          varargs: false,
          call: function(test, message) {
            if (test === 1) {
              warn(message);
            }
            return test;
          }
        });
        //-------------------------------------------------------------------------------------------------------
        this.create_function({
          name: prefix + 'warn_unless',
          deterministic: true,
          varargs: false,
          call: function(test, message) {
            if ((test == null) || (test === 0)) {
              warn(message);
            }
            return test;
          }
        });
        //=======================================================================================================
        // VARIABLES
        //-------------------------------------------------------------------------------------------------------
        this.variables = {};
        //-------------------------------------------------------------------------------------------------------
        this.create_function({
          name: prefix + 'getv',
          deterministic: false,
          call: this.getv.bind(this)
        });
        //-------------------------------------------------------------------------------------------------------
        this.create_table_function({
          name: prefix + 'variables',
          deterministic: false,
          columns: ['name', 'value'],
          parameters: [],
          rows: (function*(name) {
            var results;
            results = [];
            for (name in this.variables) {
              results.push((yield [name, this.getv(name)]));
            }
            return results;
          }).bind(this)
        });
        //=======================================================================================================
        // DATETIME
        //-------------------------------------------------------------------------------------------------------
        this.create_function({
          /* Returns a DBay_timestamp representing the present point in time. */
          name: prefix + 'dt_now',
          deterministic: false,
          varargs: false,
          call: () => {
            return this.dt_now();
          }
        });
        //-------------------------------------------------------------------------------------------------------
        this.create_function({
          /* Given a DBay_timestamp, returns an English human-readable text indicating the remoteness of that
               time relative to now, like 'four minutes ago' or 'in a week'. */
          name: prefix + 'dt_from_now',
          deterministic: false,
          varargs: false,
          call: (dbayts) => {
            return this.dt_from_now(dbayts);
          }
        });
        //-------------------------------------------------------------------------------------------------------
        return null;
      }

      //=========================================================================================================
      // VARIABLES (2)
      //---------------------------------------------------------------------------------------------------------
      setv(name, value) {
        return this.variables[name] = value;
      }

      //---------------------------------------------------------------------------------------------------------
      getv(name) {
        var R;
        if ((R = this.variables[name]) === void 0) {
          throw new E.DBay_unknown_variable('^dbay/stdlib@1^', name);
        }
        switch (false) {
          case R !== true:
            return 1;
          case R !== false:
            return 0;
          default:
            return R;
        }
      }

      //=========================================================================================================
      // DATETIME (2)
      //---------------------------------------------------------------------------------------------------------
      dt_from_now(dbayts) {
        return (this.dt_parse(dbayts)).fromNow();
      }

      //---------------------------------------------------------------------------------------------------------
      dt_now(cfg) {
        var R;
        this.types.validate.dba_dt_now_cfg((cfg = {...this.constructor.C.defaults.dba_dt_now_cfg, ...cfg}));
        R = this._dayjs().utc();
        if (cfg.subtract != null) {
          R = R.subtract(...cfg.subtract);
        }
        if (cfg.add != null) {
          R = R.add(...cfg.add);
        }
        return R.format(this._dt_dbay_timestamp_output_template);
      }

      //---------------------------------------------------------------------------------------------------------
      dt_dbayts_from_isots(isots) {
        return (this._dayjs(isots)).utc().format(this._dt_dbay_timestamp_output_template);
      }

      //---------------------------------------------------------------------------------------------------------
      dt_parse(dbayts) {
        var R;
        this.types.validate.dbay_dt_timestamp(dbayts);
        R = (this._dayjs(dbayts, this._dt_dbay_timestamp_input_template)).utc();
        if (!this.types.isa.dbay_dt_valid_dayjs(R)) {
          throw new E.DBay_invalid_timestamp('^dbay/stdlib@1^', dbayts);
        }
        return R;
      }

      //---------------------------------------------------------------------------------------------------------
      dt_format(dbayts, ...P) {
        var R;
        R = this.dt_parse(dbayts);
        return R.format(...P);
      }

      //---------------------------------------------------------------------------------------------------------
      dt_isots_from_dbayts(dbayts) {
        return (this.dt_parse(dbayts)).format();
      }

    };
  };

}).call(this);

//# sourceMappingURL=stdlib-mixin.js.map