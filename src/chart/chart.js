Charicharts.Chart = Chart;

// Chart constructor.
function Chart() {
  this.init.apply(this, arguments);

  return {
    on: this.$scope.on,
    unbind: this.$scope.unbind
  };
}

// Chart parts dependencies.
Chart.modules = [
  p_events,
  p_svg,
  p_scale,
  p_axes,
  p_series,
  // p_trail
];

// Initialize teh Chart.
Chart.prototype.init = function(opts, data) {
  this._opts = this.parseOpts(opts);
  this._data = data;
  loadModules.apply(this, [Chart.modules]);
};

// Method that loadmodules and set the $scope.
function loadModules(modules) {
  var self = this;

  // Set $scope
  this.$scope = {};
  this.$scope.opts = this._opts;
  this.$scope.data = this._data;

  // Generate injector caller
  var caller = generateInjector(this.$scope);

  // Load modules
  _.each(modules, function(module) {
    var defs = caller(module);
    _.extend(self.$scope, defs);
  });
}