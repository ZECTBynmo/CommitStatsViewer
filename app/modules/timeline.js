define([
  // Global application context.
  "app",

  // Third-party libraries.
  "backbone",

  // Modules
  "modules/repo"
],

function(app, Backbone, Repo) {

  var TimeLine = app.module();
  
  TimeLine.Model = Backbone.Model.extend({
    defaults: function() {}
  });

  TimeLine.Views.Item = Backbone.View.extend({
    template: "timeline/item",

    tagName: "div",

    data: function() {
      return { model: this.model };
    },
	
    initialize: function( options ) {
      this.model.on("change", this.render, this);
    },

    beforeRender: function() {
      
    },

    render: function (container) {

    },

    afterRender: function() {
      
    }
  });
	
	TimeLine.Views.List = Backbone.View.extend({
    template: "timeline/list",

    data: function() {
      return {};
    },

    cleanup: function() {
	
    },

    beforeRender: function() {
      var timelineItem = new TimeLine.Model();

      this.insertView("div", new TimeLine.Views.Item({
        model: timelineItem
      }));
    },

    afterRender: function() {
  
    },

    initialize: function() {
		
    }
  });
  
  return TimeLine;

});
