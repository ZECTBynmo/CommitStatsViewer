define([
  // Global application context.
  "app",

  // Third-party libraries.
  "backbone"
],

function(app, Backbone) {

  var Intro = app.module();
  
  Intro.Model = Backbone.Model.extend({
    defaults: function() {}
  });

  Intro.Views.Item = Backbone.View.extend({
    template: "intro/item",
    el: '#intro',
    tagName: "div",

    data: function() {
      return { model: this.model };
    },
	
    initialize: function( options ) {

    },

    afterRender: function() {

    }
  });
  
  return Intro;

});
