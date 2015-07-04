var Settings = require("cloud/utils/settings")

Parse.Cloud.beforeSave(Parse.User, function(req, res) {
  var user = req.object

  if(!user.isNew()) return res.success()

  return res.success()
})
