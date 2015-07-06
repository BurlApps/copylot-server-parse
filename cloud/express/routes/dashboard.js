var Project = Parse.Object.extend("Project")

module.exports.home = function(req, res) {
  var projectsRelation = req.user.relation("projects")

  projectsRelation.query().find(function(projects) {
    if(projects.length == 0) {
      res.redirect('/projects/new')
    } else {
      res.renderT('dashboard/index', {
        projects: projects
      })
    }
  })
}

module.exports.new = function(req, res) {
  res.renderT('dashboard/newProject')
}

module.exports.newPOST = function(req, res) {

}
