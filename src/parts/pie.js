var p_pie = PClass.extend({

  deps: [
    'svg',
    'opts',
    'data'
  ],

  _subscriptions: [
  ],

  initialize: function() {
    // data layout
    var pieLayout = d3.layout.pie()
      .sort(null)
      .value(function(d) {return d.value;});

    // Pie arc
    var pieArc = d3.svg.arc()
      .innerRadius(this.opts.radius * this.opts.innerRadius)
      .outerRadius(this.opts.radius);

    // Draw pie
    var piePieces = this.svg.selectAll('path')
        .data(pieLayout(this.data))
        .enter()
      .append('path')
      .attr('class', 'pie-piece')
      .attr('fill', _.bind(function(d) {
        return d.data.color;
      }, this))
      .attr('d', pieArc);

    return {
      add: this.add
    };
  },

  /**
   * Update the pie.
   */
  update: function() {

  }

});