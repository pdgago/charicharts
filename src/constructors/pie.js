Charicharts.Pie = CClass.extend({

  modules: [
    p_svg,
    p_pie,
    p_pie_inner_arrow
  ],

  getInstanceProperties: function() {
    return _.pick(this.$scope, 'series', 'moveArrowToId');
  },

  defaults: {
    margin: '0 0 0 0',
    innerRadius: 0.6,
    hoverFade: 1,
    innerArrow: false,
    innerArrowSize: 0.5
  },

  parseOptions: function(options) {
    var o = _.extend({}, this.defaults, options);
    o.margin = _.object(['top', 'right', 'bottom', 'left'],
      o.margin.split(' ').map(Number));
    o.fullWidth = o.target.offsetWidth;
    o.fullHeight = o.target.offsetHeight;
    o.width = o.fullWidth - o.margin.left - o.margin.right;
    o.height = o.fullHeight - o.margin.top - o.margin.bottom;
    o.gmainTranslate = h_getTranslate(o.fullWidth/2, o.fullHeight/2);
    o.radius = Math.min(o.fullWidth, o.fullHeight) / 2;
    return o;
  }

});