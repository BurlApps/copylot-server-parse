var Settings = require("cloud/utils/settings")
var express = require('express')
var app = express()
var random = Math.random().toString(36).slice(2)

// Set Master Key
Parse.Cloud.useMasterKey()

// Routes
var routes = {
  core: require("cloud/express/routes/index"),
  auth: require("cloud/express/routes/auth"),
  dashboard: require("cloud/express/routes/dashboard")
}

// Global app configuration section
app.set('views', 'cloud/express/views')
app.set('view engine', 'ejs')

app.enable('trust proxy')

app.use(express.bodyParser())
app.use(express.cookieParser())
app.use(express.cookieSession({
  secret: 'ursid',
  cookie: {
    httpOnly: true,
    maxAge: 604800000,
    proxy: true
  },
  rolling: true
}))
app.use(express.csrf())
app.use(function(req, res, next) {
  // Success Shorcut
  res.successT = function(data) {
    data = data || {}
    data.success = true
    res.json(data)
  }

  // Error Shorcut
  res.errorT = function(error) {
    if(typeof error != "string") {
      error = error.description || error.message || "An error occurred"
    }

    console.error(error)

    res.json({
      success: false,
      status: 1,
      message: error
    })
  }

  // Render Shorcut
  res.renderT = function(template, data) {
    data = data || {}
    data.template = data.template || template
    data.user = data.user || req.session.user
    data.tutor = data.tutor || req.session.tutor
    res.render(template, data)
  }

  // Auth
  req.basicAuth = express.basicAuth
  res.locals.csrf = req.session._csrf

  // Locals
  res.locals.host = req.session.host || ("http://" + req.host)
  res.locals.url = res.locals.host + req.url
  res.locals.user = req.session.user
  res.locals.mixpanelToken = req.session.mixpanelToken
  res.locals.random = random
  res.locals.config = {}

  if(req.session.appliedSettings !== true || !req.session.mixpanelToken) {
    Settings().then(function(settings) {
	    req.session.appliedSettings = true
	    req.session.account = settings.get("account")
	    req.session.host = settings.get("host")
      req.session.mixpanelToken = settings.get("mixpanelToken")
      res.locals.host = req.session.host
      res.locals.url = res.locals.host + req.url
      res.locals.account = req.session.account
      res.locals.mixpanelToken = req.session.mixpanelToken
      next()
    })
  } else {
    next()
  }
})

// Landing
app.get('/', routes.core.home)

// Auth
app.get('/login', routes.auth.loggedIn, routes.auth.login)
app.get('/logout', routes.auth.logout)
app.get('/register', routes.auth.loggedIn, routes.auth.register)
app.get('/reset', routes.auth.reset)
app.get('/reset/password', routes.auth.resetPassword)
app.get('/reset/success', routes.auth.resetSuccess)
app.get('/email/success', routes.auth.emailSuccess)
app.get('/auth/router', routes.auth.authRouter)
app.get('/auth/expired', routes.auth.expired)
app.post('/login', routes.auth.loginUser)
app.post('/register', routes.auth.registerUser)
app.post('/reset', routes.auth.resetUser)

// Dashboard
app.get('/dashboard', routes.auth.restricted, routes.dashboard.home)

// Terms & Privacy
app.get('/terms', routes.core.terms)
app.get('/privacy', routes.core.privacy)

// Robots
app.get('/robots', routes.core.robots)
app.get('/robots.txt', routes.core.robots)

// Sitemap
app.get('/sitemap', routes.core.sitemap)
app.get('/sitemap.xml', routes.core.sitemap)

// Not Found Redirect
app.all("*", routes.core.notfound)

// Listen to Parse
app.listen()
