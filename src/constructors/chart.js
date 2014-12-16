Charicharts.Chart = CClass.extend({

  modules: [
    p_svg,
    p_scale,
    p_axes,
    p_series,
    p_trail
  ],

  /**
   * What is going to be returned to the chart instance.
   * @return {Object} Chart properties
   */
  getInstanceProperties: function() {
    return _.pick(this.$scope, 'series');
  },

  defaults: {
    margin: '0 0 0 0',
    trail: {
      enabled: false,
      parseStep: function(xvalue) {
        return xvalue;
      },
      initXValue: function(xscale) {
        return xscale.domain()[1];
      }
    },
    // Xaxis Options.
    xaxis: {
      scale: 'time',
      fit: true,
      ticks: false,
      top: {
        enabled: false,
        label: false,
        tickFormat: function(d) {
          return d;
        }
      },
      bottom: {
        enabled: true,
        label: false,
        tickFormat: function(d) {
          return d;
        }
      }
    },
    // Yaxis Options.
    yaxis: {
      scale: 'linear',
      fit: false,
      fullGrid: true,
      textMarginTop: 0,
      ticks: false,
      left: {
        enabled: true,
        label: false,
        tickFormat: function(d) {
          return d;
        }
      },
      right: {
        enabled: false,
        label: false,
        tickFormat: function(d) {
          return d;
        }
      }
    }
  },

  parseOptions: function(options) {
    var o = _.extend({}, this.defaults, options);

    // TODO => Use deep extend to clone defaults and supplied options.
    o.trail = _.extend({}, this.defaults.trail, o.trail);
    o.xaxis = _.extend({}, this.defaults.xaxis, o.xaxis);
    o.xaxis.bottom = _.extend({}, this.defaults.xaxis.bottom, o.xaxis.bottom);
    o.xaxis.top = _.extend({}, this.defaults.xaxis.top, o.xaxis.top);
    o.yaxis = _.extend({}, this.defaults.yaxis, o.yaxis);
    o.yaxis.left = _.extend({}, this.defaults.yaxis.left, o.yaxis.left);
    o.yaxis.right = _.extend({}, this.defaults.yaxis.right, o.yaxis.right);

    o.margin = _.object(['top', 'right', 'bottom', 'left'],
      o.margin.split(' ').map(Number));

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
  }

});