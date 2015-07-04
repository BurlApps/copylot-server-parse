var User = Parse.User
var Settings = require("cloud/utils/settings")

module.exports.restricted = function(req, res, next) {
	if(req.session.userID) {
  	var user = new User()

  	user.id = req.session.userID
  	user.fetch().then(function() {
    	req.user = user
      next()
  	}, function() {
    	req.session = null
      res.redirect("/login?next=" + req.url)
  	})
	} else if(req.xhr) {
		res.errorT("Login required :(")
	} else {
  	req.session = null
		res.redirect("/login?next=" + req.url)
	}
}

module.exports.login = function(req, res) {
  res.renderT('auth/login', {
    next: req.param("next"),
    remember: req.cookies.remember || ""
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

module.exports.loginUser = function(req, res) {
  Parse.User.logIn(req.param("email"), req.param("password"), {
	  success: function(user) {
  	  if(!user) {
    	  return res.errorT("Invalid credentials :(")
  	  }

      if(req.param("remember") == "true") {
        res.cookie('remember', req.param("email"), {
          maxAge: 900000,
          httpOnly: 604800000
        })
      }

  	  req.session.userID = user.id

  	  res.successT({
        user: user.id,
        name: user.get("name"),
        email: user.get("email"),
		  	next: req.param("next") || "/dashboard"
	  	})
	  },
	  error: function(user, error) {
      res.errorT("Invalid credentials :(")
	  }
	})
}

module.exports.registerUser = function(req, res) {
  if(req.param("password") != req.param("password_confirm")) {
    return res.errorT("Passwords Don't Match :(")
  }

  var user = new User()
  user.set("username", req.param("email"))
  user.set("password", req.param("password"))
  user.set("email", req.param("email"))

  user.signUp(null, {
    success: function(user) {
  	  if(!user) {
    	  return res.errorT("Something Went Wrong :(")
  	  }

  	  req.session.userID = user.id

  	  res.successT({
        user: user.id,
        name: user.get("name"),
        email: user.get("email"),
		  	next: req.param("next") || "/dashboard"
	  	})
	  },
	  error: function(user, error) {
  	  var message = "Something Went Wrong :("

  	  if(error.code == 202) {
    	  message = "Email Already Used :("
  	  }

      res.errorT(message)
	  }
  })
}
