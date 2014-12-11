/**
 * Constructor Class. All charicharts constructors extends this Class.
 */
var CClass = Class.extend({

  init: function(opts, data) {
    // Set scope with core objects populated
    this.$scope = {
      opts: this.parseOptions(opts),
      status: {
        data: data
      }
    };

    // Set events module into the $scope.
    _.extend(this.$scope, charichartsEvents());
    this._loadModules();

    // Core methods exposed
    return _.extend(this.getInstanceProperties(), {
      on: this.$scope.on,
      unbind: this.$scope.unbind,
      update: _.bind(this.updateData, this)
    });
  },

  _loadModules: function() {
    for (var i = 0; i < this.modules.length; i++) {
      _.extend(this.$scope, new this.modules[i](this.$scope));
    }
  },

  updateData: function(data) {
    this.$scope.status.data = data;
    this.$scope.trigger('Data/update', []);
  }

});