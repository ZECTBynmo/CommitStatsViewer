define([
  // Global application context.
  "app",

  // Third-party libraries.
  "backbone",

  // Modules
  "modules/repo"
],

function(app, Backbone, Repo) {

  var PunchCard = app.module();
  
  PunchCard.Model = Backbone.Model.extend({
    defaults: function() {}
  });

  PunchCard.Views.Item = Backbone.View.extend({
    template: "punchcard/item",

    tagName: "canvas",

    data: function() {
      return { model: this.model };
    },
    
	changeUser: function(ev) {
      var model = this.model;
      var branch = model.branch;
      var name = model.name;

      app.router.go("branch", branch, "user", name);
    },
	
    initialize: function() {
      this.model.on("change", this.render, this);
    }
  });
	
	PunchCard.Views.List = Backbone.View.extend({
    template: "punchcard/list",

    data: function() {
      return {};
    },

    cleanup: function() {
	
    },

    beforeRender: function() {

    },

    afterRender: function() {
		var canvasElement = document.getElementById("mainCanvas");
		var context = canvasElement.getContext("2d");
		
		var width = 125;  // Triangle Width
		var height = 105; // Triangle Height
		var padding = 20;

		// Draw a path
		context.beginPath();
		context.moveTo(padding + width/2, padding);        // Top Corner
		context.lineTo(padding + width, height + padding); // Bottom Right
		context.lineTo(padding, height + padding);         // Bottom Left
		context.closePath();

		// Fill the path
		context.fillStyle = "#ffc821";
		context.fill();
    },

    initialize: function() {
		
    }
  });
  
  return PunchCard;

});
