
'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'DBAY/MAIN'
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
info                      = CND.get_logger 'info',      badge
urge                      = CND.get_logger 'urge',      badge
help                      = CND.get_logger 'help',      badge
whisper                   = CND.get_logger 'whisper',   badge
echo                      = CND.echo.bind CND
#...........................................................................................................
PATH                      = require 'path'
FS                        = require 'fs'
shm_path                  = '/dev/shm'
guy                       = require 'guy'
URL                       = require 'url'
types                     = new ( require 'intertype' ).Intertype()
{ isa
  validate }              = types.export()

#-----------------------------------------------------------------------------------------------------------
types.declare 'fspath_for_url', tests:
  "@isa.nonempty_text x": ( x ) -> @isa.nonempty_text x
  "x.startsWith '/'":     ( x ) -> x.startsWith '/'


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
@url_from_path = ( path ) ->
  validate.fspath_for_url path
  return ( URL.pathToFileURL path ).href

#-----------------------------------------------------------------------------------------------------------
@path_from_url = ( url  ) ->
  return URL.fileURLToPath url




