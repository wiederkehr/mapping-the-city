#= require_self
#
#= require jquery/jquery
#
#= require lodash/lodash
#= require handlebars/handlebars
#= require d3/d3
#= require xdate/src/xdate

###
# This is the import map for all shared files (our own and vendor libraries)
###

# Define application namespace and base config
window.App =
  config:
    googleAnalyticsAccount: null
