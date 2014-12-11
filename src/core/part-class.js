/**
 * Part Class. All charicharts parts extends this Class.
 */
var PClass = Class.extend({

  init: function($scope) {
    this._loadModules($scope);
    _.each(this._subscriptions, this._subscribe, this);
    return this.initialize();
  },

  /**
   * Load dependencies modules.
   */
  _loadModules: function($scope) {
    // Populate core modules
    this.svg = $scope.svg;
    this.opts = $scope.opts;
    this.data = $scope.data;
    this.on = $scope.on;
    this.trigger = $scope.trigger;

    for (var i = this.deps.length - 1; i >= 0; i--) {
      this[this.deps[i]] = $scope[this.deps[i]];
    }
  },

  /**
   * Subscribe to module events.
   */
  _subscribe: function(subscription) {
    _.each(subscription, _.bind(function(callback, name) {
      this.on(name, _.bind(callback, this));
    },this));
  }

});