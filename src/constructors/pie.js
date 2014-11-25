Charicharts.Pie = CClass.extend({

  modules: [
    p_svg,
    p_pie,
    // p_pieInnerArrow
  ],

  getInstanceProperties: function() {
    return {
      update: this.$scope.update
    };
  },

  defaults: {
    margin: '0,0,0,0',
    innerRadius: 0.6,
    fadeOpacity: 1,
    innerArrow: false,
    innerArrowSize: 0.6
  },

  parseOptions: function(options) {
    var o = _.extend({}, this.defaults, options);
    o.margin = _.object(['top', 'right', 'bottom', 'left'],
      o.margin.split(',').map(Number));
    o.fullWidth = o.target.offsetWidth;
    o.fullHeight = o.target.offsetHeight;
    o.width = o.fullWidth - o.margin.left - o.margin.right;
    o.height = o.fullHeight - o.margin.top - o.margin.bottom;
    o.gmainTranslate = h_getTranslate(o.fullWidth/2, o.fullHeight/2);
    o.radius = Math.min(o.fullWidth, o.fullHeight) / 2;
    return o;
  }

});