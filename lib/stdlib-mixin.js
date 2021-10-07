(function() {
  'use strict';
  var CND, badge, debug, echo, freeze, help, info, lets, rpr, urge, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'DBAY/MIXIN/STDLIB';

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  info = CND.get_logger('info', badge);

  urge = CND.get_logger('urge', badge);

  help = CND.get_logger('help', badge);

  whisper = CND.get_logger('whisper', badge);

  echo = CND.echo.bind(CND);

  ({freeze, lets} = require('letsfreezethat'));

  //-----------------------------------------------------------------------------------------------------------
  this.DBay_stdlib = (clasz = Object) => {
    return class extends clasz {
      /* TAINT use `cfg` */
      //---------------------------------------------------------------------------------------------------------
      _$stdlib_initialize() {
        this._stdlib_created = false;
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
        this.create_table_function({
          name: prefix + 'str_split',
          columns: ['part'],
          parameters: ['text', 'splitter', 'omit_empty'],
          deterministic: true,
          varargs: false,
          rows: function*(text, splitter, omit_empty = false) {
            var i, j, len, len1, part, ref, ref1;
            if (omit_empty) {
              ref = text.split(splitter);
              for (i = 0, len = ref.length; i < len; i++) {
                part = ref[i];
                if (part.length > 0) {
                  yield ({part});
                }
              }
            } else {
              ref1 = text.split(splitter);
              for (j = 0, len1 = ref1.length; j < len1; j++) {
                part = ref1[j];
                yield ({part});
              }
            }
            return null;
          }
        });
        //-------------------------------------------------------------------------------------------------------
        this.create_table_function({
          name: prefix + 'str_split_re',
          columns: ['part'],
          parameters: ['text', 'splitter', 'flags', 'omit_empty'],
          deterministic: false,
          varargs: true,
          rows: function*(text, splitter, flags = null, omit_empty = false) {
            var i, j, len, len1, part, re, ref, ref1;
            omit_empty = !!omit_empty;
            if (flags != null) {
              re = new RegExp(splitter, flags);
            } else {
              re = new RegExp(splitter);
            }
            if (omit_empty) {
              ref = text.split(re);
              for (i = 0, len = ref.length; i < len; i++) {
                part = ref[i];
                if (part.length > 0) {
                  yield ({part});
                }
              }
            } else {
              ref1 = text.split(re);
              for (j = 0, len1 = ref1.length; j < len1; j++) {
                part = ref1[j];
                yield ({part});
              }
            }
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
        return null;
      }

    };
  };

}).call(this);

//# sourceMappingURL=stdlib-mixin.js.map