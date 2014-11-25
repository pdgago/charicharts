var p_pie = PClass.extend({

  deps: [
    'svg',
    'opts',
    'data'
  ],

  _subscriptions: [
  ],

  initialize: function() {
    // pie layout
    this.pie = d3.layout.pie()
      .value(function(d) {return d.value;})
      .sort(null);

    // Pie arc
    this.arc = d3.svg.arc()
      .innerRadius(this.opts.radius * this.opts.innerRadius)
      .outerRadius(this.opts.radius);

    // Paths
    this.path = this.svg.selectAll('path');
    this.update();

    return {
      update: _.bind(this.update, this),
      path: this.path,
      arc: this.arc
    };
  },

  /**
   * Update the pie.
   */
  update: function() {
    var self = this;
    var data = this.pie(this.data);
    this.path = this.path.data(data);

    this.path.enter().append('path')
      .each(function(d, i) {
        this._current = d;
      })
      .attr('class', 'pie-piece');

    this.path.attr('fill', function(d) {return d.data.color;});
    this.path.exit().remove();

    this.path.transition()
      .duration(300)
      .attrTween('d', arcTween);

    function arcTween(d) {
      var i = d3.interpolate(this._current, d);
      this._current = i(0);
      return function(t) {
        return self.arc(i(t));
      };
    }
  },

});