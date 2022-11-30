(function() {
  'use strict';
  var FS, GUY, PATH, alert, debug, echo, help, info, inspect, log, plain, praise, rpr, shm_path, urge, warn, whisper;

  //###########################################################################################################
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('DBAY/HELPERS'));

  ({rpr, inspect, echo, log} = GUY.trm);

  //...........................................................................................................
  PATH = require('path');

  FS = require('fs');

  shm_path = '/dev/shm';

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

  //-----------------------------------------------------------------------------------------------------------
  this.SQL = function(parts, ...expressions) {
    var R, expression, i, idx, len;
    R = parts[0];
    for (idx = i = 0, len = expressions.length; i < len; idx = ++i) {
      expression = expressions[idx];
      R += expression.toString() + parts[idx + 1];
    }
    return R;
  };

}).call(this);

//# sourceMappingURL=helpers.js.map