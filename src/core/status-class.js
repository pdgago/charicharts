var StatusClass = Class.extend({

  init: function(attrs) {
    this.attributes = {};
    return this;
  },

  get: function(attr) {
    return this.attributes[attr];
  },

  set: function(attrs) {
    _.extend(this.attributes, attrs);
  },

  toJSON: function() {
    return _.clone(this.attributes);
  }

});