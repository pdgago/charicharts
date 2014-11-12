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

  // temporal => mode this from here
  this.toggleSerie = function(serieId) {
    var el = self.$scope.svg.select('#serie' + serieId);
    if (el.empty()) {return;}
    var active = Number(el.attr('active')) ? 0 : 1;
    el.attr('active', active);

    el.transition()
      .duration(200)
      .style('opacity', el.attr('active'));
  };

  // // Draw trail (optional)
  // // Add a trail line to the chart and trigger a 'moveTrail'
  // // event when the user moves the trail.
  if (this.$scope.trail) {
    this.call(p_trail);
  }
};