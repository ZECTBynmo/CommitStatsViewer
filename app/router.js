define([
  // Application.
  "app",

  // Modules.
  "modules/punchcard",
  "modules/user"
],

function(app, PunchCard, User) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "branch/:name": "branch",
      "branch/:name": "branch",
      "org/:name": "org",
      "org/:org/user/:name": "user",
      "org/:org/user/:user/repo/:name": "punchcard"
    },

    index: function() {
      // Reset the state and render.
      this.reset();
    },

    branch: function(name) {
      // Reset the state and render.
      this.reset();

      // Set the organization.
      this.users.branch = name;

      // Fetch the data.
      this.users.fetch();
    },
	
	org: function(name) {
      // Reset the state and render.
      this.reset();

      // Set the organization.
      this.users.org = name;

      // Fetch the data.
      this.users.fetch();
    },

    user: function(org, name) {
      // Reset the state and render.
      this.reset();

      // Set the organization.
      this.users.org = org;

      // Fetch the data
      this.users.fetch();
    },

    punchcard: function(org, user, name) {
      // Reset the state and render.
      this.reset();

      // Set the organization.
      this.users.org = org;

      // Fetch the data
      this.users.fetch();
    },

    // Shortcut for building a url.
    go: function() {
      return this.navigate(_.toArray(arguments).join("/"), true);
    },

    reset: function() {
      // Reset collections to initial state.
      if (this.users.length) {
        this.users.reset();
      }

      // Reset active model.
      app.active = false;
    },

    initialize: function() {
      var collections = {
        // Set up the users.
        users: new User.Collection()
      };

      // Ensure the router has references to the collections.
      _.extend(this, collections);

      // Use main layout and set Views.
      app.useLayout().setViews({
        ".users": new User.Views.List(collections),
		".punchcard": new PunchCard.Views.List(collections)
      }).render();
    }
  });

  return Router;

});
