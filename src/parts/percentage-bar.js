/**
 * Percentage Bar
 * --------------
 * Add a percentage bar to the supplied svg.
 *
 */
var p_percentage_bar = PClass.extend({

  deps: [
  ],

  _subscriptions: [{
  }],


  initialize: function() {
    this.opts.gridTicks && this._renderGrid();

    switch(this.opts.orientation) {
      case 'vertical': this._renderVertical(); break;
      case 'horizontal': this._renderHorizontal(); break;}

    this._setEvents();

    return {
      bar: {
        path: this.path,
        triggerMouseover: _.bind(this.triggerMouseover, this)
      }
    };
  },

  _setEvents: function() {
    var self = this;
    this.path.on('mousemove', function(d) {
      self._onMouseover(this, d);
    });

    this.$svg.on('mouseleave', function() {
      self.path.style('opacity', 1);
    });
  },

  _renderHorizontal: function() {
    var total = d3.sum(_.pluck(this.data, 'value'));
    var x0 = 0;

    var data = _.map(this.data,
      function(d) {
        var v = _.extend(d, {
          x0: x0,
          x1: d.value * 100 / total
        });
        x0 += v.x1;
        return v;
      });

    this.path = this.$svg.selectAll('rect')
        .data(data)
      .enter().append('rect')
        .attr('x', function(d, i) {
          return d.x0 + '%';
        })
        .attr('y', 0)
        .attr('width', function(d) {
          return d.x1 + '%';
        })
        .attr('height', this.opts.fullHeight)
        .style('fill', function(d) {
          return d.color;
        });
  },

  _renderVertical: function() {
    var total = d3.sum(_.pluck(this.data, 'value'));
    var height = (this.opts.margin.top + this.opts.margin.bottom) * 100 / this.opts.height;
    var heightPercent = 100 - height;
    var y0 = 0;

    var data = _.map(this.data,
      function(d) {
        var v = _.extend(d, {
          y0: y0,
          y1: d.value * heightPercent / total
        });
        y0 += v.y1;
        return v;
      });

    this.path = this.$svg.selectAll('rect')
        .data(data)
      .enter().append('rect')
        .attr('x', 0)
        .attr('y', function(d) {
          return d.y0 + '%';
        })
        .attr('width', this.opts.width)
        .attr('height', function(d) {
          return d.y1 + '%';
        })
        .style('fill', function(d) {
          return d.color;
        });
  },

  /**
   * Renders grid on the background.
   */
  _renderGrid: function() {
    var separation = this.opts.fullHeight / (this.opts.gridTicks-1) - 1/this.opts.gridTicks;

    this.grid = this.$svg.append('g')
      .attr('transform', h_getTranslate(-this.opts.margin.left, -this.opts.margin.top))
      .attr('class', 'bargrid');

    for (var i = 0; i < this.opts.gridTicks; i++) {
      this.grid.append('line')
        .attr('x1', 0)
        .attr('x2', this.opts.fullWidth)
        .attr('y1', separation*i)
        .attr('y2', separation*i)
        .attr('stroke', 'red');
    }
  },

  _onMouseover: function(path, d) {
    this.path.style('opacity', this.opts.hoverFade);
    d3.select(path).style('opacity', 1);
    var mouse;

    try {
      mouse = d3.mouse(path);
    } catch(e) {
      mouse = h_getCentroid(d3.select(path));
    }

    this.trigger('Bar-piece/mouseover', [d, mouse]);
  },

  triggerMouseover: function(id) {
    var self = this;

    this.path.each(function(d) {
      if (d.id !== id) {return;}
      self._onMouseover(this, d);
    });
  }

});
