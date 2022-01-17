(function() {
  'use strict';
  var CND, FS, PATH, URL, badge, debug, echo, guy, help, info, isa, rpr, shm_path, types, urge, validate, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'DBAY/MAIN';

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  info = CND.get_logger('info', badge);

  urge = CND.get_logger('urge', badge);

  help = CND.get_logger('help', badge);

  whisper = CND.get_logger('whisper', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  PATH = require('path');

  FS = require('fs');

  shm_path = '/dev/shm';

  guy = require('guy');

  URL = require('url');

  types = new (require('intertype')).Intertype();

  ({isa, validate} = types.export());

  //-----------------------------------------------------------------------------------------------------------
  types.declare('fspath_for_url', {
    tests: {
      "@isa.nonempty_text x": function(x) {
        return this.isa.nonempty_text(x);
      },
      "x.startsWith '/'": function(x) {
        return x.startsWith('/');
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.is_directory = function(path) {
    var error;
    try {
      return (FS.statSync(path)).isDirectory();
    } catch (error1) {
      error = error1;
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
    return false;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.is_file = function(path) {
    var error;
    try {
      return (FS.statSync(path)).isFile();
    } catch (error1) {
      error = error1;
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
    return false;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.unlink_file = function(path) {
    var error;
    try {
      /* Given a `path`, unlink the associated file; in case no file is found, ignore silently. If an error
       occurs, just print a warning. To be used in an exit handler, so no error handling makes sense here. */
      FS.unlinkSync(path);
    } catch (error1) {
      error = error1;
      if (error.code !== 'ENOENT') {
        warn('^dbay@1^', error.message);
      }
    }
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.autolocation = this.is_directory(shm_path) ? shm_path : (require('os')).tmpdir();

}).call(this);

//# sourceMappingURL=helpers.js.map