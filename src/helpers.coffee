
'use strict'


############################################################################################################
GUY                       = require 'guy'
{ alert
  debug
  help
  info
  plain
  praise
  urge
  warn
  whisper }               = GUY.trm.get_loggers 'DBAY/HELPERS'
{ rpr
  inspect
  echo
  log     }               = GUY.trm
#...........................................................................................................
PATH                      = require 'path'
FS                        = require 'fs'
shm_path                  = '/dev/shm'


#-----------------------------------------------------------------------------------------------------------
@is_directory = ( path ) ->
  try
    return ( FS.statSync path ).isDirectory()
  catch error
    throw error unless error.code is 'ENOENT'
  return false

#-----------------------------------------------------------------------------------------------------------
@is_file = ( path ) ->
  try
    return ( FS.statSync path ).isFile()
  catch error
    throw error unless error.code is 'ENOENT'
  return false

#-----------------------------------------------------------------------------------------------------------
@unlink_file = ( path ) ->
  ### Given a `path`, unlink the associated file; in case no file is found, ignore silently. If an error
  occurs, just print a warning. To be used in an exit handler, so no error handling makes sense here. ###
  try FS.unlinkSync path catch error
    warn '^dbay@1^', error.message unless error.code is 'ENOENT'
  return null

#-----------------------------------------------------------------------------------------------------------
@autolocation = if @is_directory shm_path then shm_path else ( require 'os' ).tmpdir()

#-----------------------------------------------------------------------------------------------------------
@SQL = ( parts, expressions... ) ->
  R = parts[ 0 ]
  for expression, idx in expressions
    R += expression.toString() + parts[ idx + 1 ]
  return R

