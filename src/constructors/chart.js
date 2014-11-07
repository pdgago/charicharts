Charicharts.Chart = Chart;

function Chart(opts) {
  this._opts = this.parseOpts(opts);
  _.extend(this, Charicharts.Events(this));
  // this.$scope = {};
  // this.$scope.opts = this._opts;
  this.$scope = _.extend({}, this._opts);
  this.$scope.trigger = this.trigger;
  this.call = generateInjector(this.$scope);
  this.render();
  return _.omit(this, '$scope', 'call', 'parseOpts', 'render');
}

/**
 * Render the chart by setting/drawing all it parts.
 */
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

/**
 * Add the supplied serie to the chart.
 * 
 * @param {Object} serie
 */
Chart.prototype.addSerie = function(serie) {
  if (serie.type === 'line') {
    this.$scope.lines = this.call(p_line).drawLine(serie);
  } else if (serie.type === 'bar') {
    this.$scope.bars = this.call(p_bar).drawBar(serie);
  } else if (serie.type === 'stacked-bar') {
    this.$scope.stackedBars = this.call(p_stacked_bar).drawBar(serie);
  }
};

/**
 * Toggle the supplied serieId.
 * 
 * @param  {Integer} serieId
 */
Chart.prototype.toggleSerie = function(serieId) {
  var el = this.$scope.svg.select('#serie' + serieId);
  if (el.empty()) {return;}
  var active = Number(el.attr('active')) ? 0 : 1;
  el.attr('active', active);

  el.transition()
    .duration(200)
    .style('opacity', el.attr('active'));
};

/**
 * Parse Given Options so it's easier to read them.
 * 
 * @param  {Object} options User options
 * @return {Object} options Parsed options
 */
Chart.prototype.parseOpts = function(opts) {
  var o = _.extend({}, Chart.defaults, opts);
  
  // TODO => Use deep extend to clone defaults and supplied opts.
  o.series = _.extend({}, Chart.defaults.series, o.series);
  o.xaxis = _.extend({}, Chart.defaults.xaxis, o.xaxis);
  o.xaxis.bottom = _.extend({}, Chart.defaults.xaxis.bottom, o.xaxis.bottom);
  o.xaxis.top = _.extend({}, Chart.defaults.xaxis.top, o.xaxis.top);
  o.yaxis = _.extend({}, Chart.defaults.yaxis, o.yaxis);
  o.yaxis.left = _.extend({}, Chart.defaults.yaxis.left, o.yaxis.left);
  o.yaxis.right = _.extend({}, Chart.defaults.yaxis.right, o.yaxis.right);

  o.margin = _.object(['top', 'right', 'bottom', 'left'],
    o.margin.split(',').map(Number));

  /**
   * Axis labels padding.
   * TODO: => Do this better.
   */
  if (o.yaxis.left.label || o.yaxis.right.label) {
    o.margin.top += Math.abs(o.yaxis.textMarginTop - 30);
  }

  o.fullWidth = o.target.offsetWidth;
  o.fullHeight = o.target.offsetHeight;
  o.width = o.fullWidth - o.margin.left - o.margin.right;
  o.height = o.fullHeight - o.margin.top - o.margin.bottom;
  o.gmainTranslate = h_getTranslate(o.margin.left, o.margin.top);

  return o;
};

/**
 * Defaults Chart options.
 */
Chart.defaults = {
  margin: '0,0,0,0',
  trail: false,
  /**
   * Series options.
   */
  series: {
    barWidth: 12,
    stackedBarAlign: 'right'
  },
  /**
   * Xaxis Options.
   */
  xaxis: {
    scale: 'time',
    fit: false,
    ticks: false,
    top: {
      enabled: false,
      label: false,
      tickFormat: function(d) {return d;}
    },
    bottom: {
      enabled: true,
      label: false,
      tickFormat: function(d) {return d.getMonth();}
    }  
  },
  /**
   * Yaxis Options.
   */
  yaxis: {
    scale: 'linear',
    fit: false,
    fullGrid: true,
    ticksMarginTop: 0,
    ticks: false,
    left: {
      enabled: true,
      label: false,
      tickFormat: function(d) {return d;}
    },
    right: {
      enabled: false,
      label: false,
      tickFormat: function(d) {return d;}
    }
  }
};