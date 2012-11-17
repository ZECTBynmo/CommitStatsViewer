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

    tagName: "div",

    data: function() {
      return { model: this.model };
    },
	
    initialize: function( options ) {
      this.committerInfo = options.model.attributes.committerInfo;
      this.model.on("change", this.render, this);
    },

    afterRender: function() {
      var canvasElement = document.getElementById("mainCanvas");

      var testUser = this.committerInfo[this.model.attributes.name];

      var graph = new PunchCardGraph( testUser );
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
      var punchCardItem = new PunchCard.Model();

      this.insertView("div", new PunchCard.Views.Item({
        model: punchCardItem
      }));
    },

    afterRender: function() {
  
    },

    initialize: function() {
		
    }
  });
  
  return PunchCard;

});
