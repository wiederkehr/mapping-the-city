#= require_self
#
#= require jquery/jquery
#
#= require lodash/lodash
#= require handlebars/handlebars-1.0.0-rc.1
#= require backbone/backbone
#= require backbone.queryparams/backbone.queryparams
#
#= require d3/d3
#
#= require xdate/index
#
#= require ixt-js-lib/backbone/BackboneExtensions
#= require ixt-js-lib/handlebars/TemplateHelpers
#= require ixt-js-lib/xdate/locales

###
# This is the import map for all shared files (our own and vendor libraries)
###

# Define application namespace and base config
window.App =
  config:
    googleAnalyticsAccount: null
