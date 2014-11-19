/**
 * Part Class. All charicharts parts extends this Class.
 */
var PClass = Class.extend({

  _coreSubscriptions: [{
    'Scope/emit': function(obj) {
      _.extend(this, obj);
    }
  }],

  init: function($scope) {
    this._loadModules($scope);
    this.status = new StatusClass();

    // Subscribe
    _.each(_.union(this._coreSubscriptions,
      this._subscriptions), this._subscribe, this);

    // Initialize P Module
    return this.initialize();
  },

  /**
   * Load dependencies modules.
   */
  _loadModules: function($scope) {
    for (var i = this.deps.length - 1; i >= 0; i--) {
      this[this.deps[i]] = $scope[this.deps[i]];
    }

    this.on = $scope.on;
    this.trigger = $scope.trigger;
  },

  /**
   * Subscribe to module events.
   */
  _subscribe: function(subscription) {
    _.each(subscription, _.bind(function(callback, name) {
      this.on(name, _.bind(callback, this));
    },this));
  },

  /**
   * Update scope variables in every PClass child
   * for the given objects.
   * 
   * @param  {Array} objs
   */
  emit: function(objs) {
    this.trigger('Scope/emit', [objs]);
  }

});