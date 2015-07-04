var User = Parse.User
var Mailgun = require("mailgun")
var Settings = require("cloud/utils/settings")

module.exports.restricted = function(req, res, next) {
	if(req.session.user && req.session.tutor.enabled) {
		next();
	} else if(req.xhr) {
		res.errorT("Login required :(")
	} else {
  	req.session = null
		res.redirect("/login?next=" + req.url)
	}
}

module.exports.login = function(req, res) {
  res.renderT('auth/login', {
    next: req.param("next")
  })
}

module.exports.logout = function(req, res) {
  req.session = null
  res.redirect("/")
}

module.exports.register = function(req, res) {
  res.renderT('auth/register')
}

module.exports.reset = function(req, res) {
  res.renderT('auth/reset')
}
