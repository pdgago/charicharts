/**
 * Part Class. All charicharts parts extends this Class.
 */
var PClass = Class.extend({

  init: function($scope) {
    this._$scope = $scope;
    this._loadModules();
    _.each(this._subscriptions, this._subscribe, this);
    return this.initialize();
  },

  /**
   * Load dependencies modules.
   */
  _loadModules: function() {
    // Populate core modules
    this.$svg = this._$scope.$svg;
    this.opts = this._$scope.opts;
    this.on = this._$scope.on;
    this.trigger = this._$scope.trigger;
    this.data = this._$scope.data;

    for (var i = this.deps.length - 1; i >= 0; i--) {
      this[this.deps[i]] = this._$scope[this.deps[i]];
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