Chart.prototype.render = function() {
  var self = this;

  // Draw svg
  this.$scope.svg = this.call(p_svg).draw();

  // Set scales
  this.$scope.xscale = this.call(p_scale).getXScale();
  this.$scope.yscale = this.call(p_scale).getYScale();

  // Draw axis
  this.call(p_axes).drawY();
  this.call(p_axes).drawX();

  _.each(this._opts.data, function(serie) {
    self.addSerie(serie);
  });

  // Draw trail (optional)
  // Add a trail line to the chart and trigger a 'moveTrail'
  // event when the user moves the trail.
  if (this._opts.trail) {
    this.call(p_trail);
  }
};