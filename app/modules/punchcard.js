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

      var user = this.committerInfo[this.model.attributes.name];

      var graph = new PunchCardGraph( user );

      // Override the global function to get the slider label's text
      globalGetDateRangeText = function() {
        var range = graph.getRange(),
            strMinValue = user.commitTimes[range.min],
            strMaxValue = user.commitTimes[range.max],
            strMin = strMinValue.substring(2, 10) + " " + strMinValue.substring(11, 16),
            strMax = strMaxValue.substring(2, 10) + " " + strMaxValue.substring(11, 16);

        return strMax + " - " + strMin;
      }

      // Override the global on slide function
      globalOnSlide = function( event, ui ) {
        var minPercent = ui.values[0]/10000,
            maxPercent = ui.values[1]/10000,
            iMin = graph.getTotalMax() - Math.floor( graph.getTotalMax() * minPercent ),
            iMax = graph.getTotalMax() - Math.floor( graph.getTotalMax() * maxPercent );

        graph.setRange( iMax, iMin );
      }
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
