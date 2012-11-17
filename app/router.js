define([
  // Application.
  "app",

  // Modules.
  "modules/punchcard",
  "modules/user"
],

function(app, PunchCard, User) {
  var globalCommitterInfo;

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "branch/:name": "branch",
      "branch/:name": "branch",
      "branch/:name/user/:name": "punchcard"
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

    user: function(org, name) {
      // Reset the state and render.
      this.reset();

      // Set the organization.
      this.users.org = org;

      // Fetch the data
      this.users.fetch();
    },

    punchcard: function(branch, userName) {
      // Reset the state and render.
      this.reset();

      // Set the organization.
      this.branch = branch;
      this.userName = userName;

      var punchCardItem = new PunchCard.Model({
          committerInfo: globalCommitterInfo,
          name: userName,
          branch: branch
      });

      // Use main layout and set Views.
      if( typeof(globalCommitterInfo) != "undefined" ) {
        var collections = {
          // Set up the users.
          users: new User.Collection(),
          committerInfo: globalCommitterInfo,
          branch:"master"
        };

        app.useLayout().setViews({
          ".users": new User.Views.List(collections),
          ".punchcard": new PunchCard.Views.Item({model:punchCardItem})
        }).render();
      }
    },

    // Shortcut for building a url.
    go: function() {
      return this.navigate(_.toArray(arguments).join("/"), true);
    },

    reset: function() {
      // Reset collections to initial state.
      if (typeof(this.users) != "undefined" && this.users.length) {
        this.users.reset();
      }

      // Reset active model.
      app.active = false;
    },

    initialize: function() {
      var socket = io.connect('http://localhost:9002');

      socket.emit( "request repository info" );

      socket.on("repository info", function(data) { 
        globalCommitterInfo = data.committerInfo;

        var collections = {
          // Set up the users.
          users: new User.Collection(),
          committerInfo: globalCommitterInfo,
          branch:"master"
        };

        // Ensure the router has references to the collections.
        _.extend(this, collections);
        this.collections = collections;

        var punchCardItem = new PunchCard.Model( {committerInfo:globalCommitterInfo} );

        // Use main layout and set Views.
        app.useLayout().setViews({
          ".users": new User.Views.List(collections),
          ".punchcard": new PunchCard.Views.Item({model:punchCardItem})
        }).render();
      }); // end on "repository info"
    }
  });

  return Router;

});
