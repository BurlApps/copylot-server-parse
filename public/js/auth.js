$(function() {
  var enablePosting = true

  $("form:not(.ignore)").on("submit", function(e) {
    e.preventDefault()
    e.stopPropagation()

    if(enablePosting) {
      var form = $(this)
      var button = form.find(".button").val("Sending...")
      enablePosting = false

      $.post(form.attr("action"), form.serialize(), function(response) {
        button.toggleClass("error", !response.success)
	      button.toggleClass("active", response.success)

        if(response.success) {
	        button.val(response.message || "Awesome :)")

          if(response.user) {
            mixpanel.alias(response.user, mixpanel.get_distinct_id())
            mixpanel.people.set({
              ID: response.user,
              $name: response.name,
              $email: response.email,
            })
          }

	      	setTimeout(function() {
            window.location.href = response.next
          }, response.delay || 300)
        } else {
	        enablePosting = true
	        button.val(response.message || "Something Went Wrong :(")
	        form.find("input[type=password]").val("")
        }
      })
    }
  })
})
