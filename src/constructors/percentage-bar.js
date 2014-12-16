Charicharts.PercentageBar = CClass.extend({

  modules: [
    p_svg,
    p_percentage_bar
  ],

  getInstanceProperties: function() {
    return _.pick(this.$scope, 'bar');
  },

  defaults: {
    margin: '0 0 0 0',
    orientation: 'horizontal',
    hoverFade: 1,
    gridTicks: 0
  },

  parseOptions: function(options) {
    var o = _.extend({}, this.defaults, options);

    o.margin = _.object(['top', 'right', 'bottom', 'left'],
      o.margin.split(' ').map(Number));

    var responsive = !o.margin.left && !o.margin.right;

    o.fullWidth = responsive ? '100%' : o.target.offsetWidth;
    o.fullHeight = o.target.offsetHeight;

    if (!responsive) {
      o.width = o.fullWidth - o.margin.left - o.margin.right;
    }

    o.height = o.fullHeight - o.margin.top - o.margin.bottom;
    o.gmainTranslate = h_getTranslate(o.margin.left, o.margin.top);
    return o;
  }

});