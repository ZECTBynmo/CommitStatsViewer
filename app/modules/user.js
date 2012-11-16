define([
  // Global application context.
  "app",

  // Third-party libraries.
  "backbone",

  // Modules
  "modules/repo"
],

function(app, Backbone, Repo) {

  var User = app.module();
  
  User.Model = Backbone.Model.extend({
    defaults: function() {
/*name: committer.name,
	  email: committer.email,
	  histogram: committer.histogram*/
    }
  });

  User.Collection = Backbone.Collection.extend({
    url: function() {
      return "https://api.github.com/orgs/" + this.org + "/members?callback=?";
    },

    cache: true,

    parse: function(obj) {
      console.log(obj);
      // Safety check ensuring only valid data is used
      if (obj.data.message !== "Not Found") {
        this.status = "valid";

        return obj.data;
      }

      this.status = "invalid";

      return obj;
    },

    initialize: function(models, options) {
      if (options) {
        this.org = options.org;
      }
    }
  });

  User.Views.Item = Backbone.View.extend({
    template: "user/item",

    tagName: "li",

    data: function() {
      return { model: this.model };
    },

    events: {
      click: "changeUser"
    },
    
	changeUser: function(ev) {
      var model = this.model;
      var branch = model.branch;
      var name = model.name;

      app.router.go("branch", branch, "user", name);
    },
	
    initialize: function() {
		this.render();
      //this.model.on("change", this.render, this);
    }
  });

  User.Views.List = Backbone.View.extend({
    template: "user/list",

    data: function() {
      return { collection: this.options.users };
    },

    cleanup: function() {
      this.options.users.off(null, null, this);
    },

    beforeRender: function() {
	  if( typeof(this.committerInfo) != "undefined" ) {
	    for( var iComitter in this.committerInfo ) {
		  var committer = this.committerInfo[iComitter],
		      userItem = new User.Model();
		  
		  userItem.name = committer.name;
		  userItem.email = committer.email;
		  userItem.histogram = committer.histogram;
		  userItem.branch = this.branch;
		
		  this.insertView("ul", new User.Views.Item({
           model: userItem
          }));
		}
	  }
	/*
      this.options.users.each(function(user) {
        this.insertView("ul", new User.Views.Item({
          model: user
        }));
      }, this);
	*/
    },

    afterRender: function() {
      // Only re-focus if invalid
      this.$("input.invalid").focus();
    },

    initialize: function() {
      this.options.users.on("reset", this.render, this);

      this.options.users.on("fetch", function() {
        this.$("ul").parent().html("<img src='/assets/img/spinner-gray.gif'>");
      }, this);
    },

    events: {
      "submit form": "updateBranch"
    },

    updateBranch: function(ev) {
	  var socket = io.connect('http://localhost:9002');
	  var _this = this;
	  socket.emit( "request repository info" );
	  socket.on("repository info", function(data) { 
	    _this.committerInfo = data.committerInfo;
		_this.render();
	  });
	  
	  this.branch = this.$(".branch").val();
	  
      app.router.go("branch", this.branch);

      return false;
    }
  });

  return User;

});
