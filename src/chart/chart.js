Charicharts.Chart = Chart;

function Chart() {
  this.init.apply(this, arguments);
}

Chart.prototype.init = function(opts) {
  this._opts = this.parseOpts(opts);
  _.extend(this, Charicharts.Events(this));
  this.$scope = _.extend({}, this._opts);
  this.$scope.trigger = this.trigger;
  this.call = generateInjector(this.$scope);
  this.render();
  return _.omit(this, '$scope', 'call', 'parseOpts', 'render');  
};

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