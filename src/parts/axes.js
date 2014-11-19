var p_axes = PClass.extend({

  deps: [
    'svg',
    'opts',
    'xscale',
    'yscale'
  ],

  _subscriptions: [{
    'Scale/update': function(data) {
    }
  }],

  initialize: function() {
    if (this.opts.yaxis.left.enabled) {
      this._setAxis('left');
    }

    if (this.opts.yaxis.right.enabled) {
      this._setAxis('right');
    }

    if (this.opts.xaxis.top.enabled) {
      this._setAxis('top');
    }

    if (this.opts.xaxis.bottom.enabled) {
      this._setAxis('bottom');
    }

    if (this.opts.yaxis.left.enabled || this.opts.yaxis.right.enabled) {
      this._setYGrid();
    }

    if (this.opts.xaxis.top.enabled || this.opts.xaxis.bottom.enabled) {
      this._setXDomainFullwidth();
    }
  },

  _setAxis: function(orient) {
    var params = {
      'bottom': {
        axis: 'xaxis',
        translate: h_getTranslate(0, this.opts.height),
        textAnchor: 'middle',
      },
      'top': {
        axis: 'xaxis',
        translate: h_getTranslate(0, 0),
        textAnchor: 'middle'
      },
      'left': {
        axis: 'yaxis',
        translate: h_getTranslate(0, 0),
        textAnchor: 'start'
      },
      'right': {
        axis: 'yaxis',
        translate: h_getTranslate(this.opts.width + this.opts.margin.right, 0),
        textAnchor: 'end'
      }
    };

    var p = params[orient];

    // Set axis
    var axis = d3.svg.axis()
      .scale(p.axis === 'xaxis' ? this.xscale : this.yscale)
      .orient(orient)
      .tickFormat(this.opts[p.axis][orient].tickFormat);

    if (this.opts[p.axis].ticks) {
      axis.ticks.apply(this, this.opts[p.axis].ticks);
    }

    // Draw axis
    var axisG = this.svg.append('g')
      .attr('class', p.axis + ' ' + orient)
      .attr('transform', p.translate)
      .call(axis);

    // Axis ticks texts
    var axisGTexts = axisG.selectAll('text');
    axisGTexts.style('text-anchor', p.textAnchor);

    if (p.axis === 'yaxis') {
      axisGTexts
        .attr('x', orient === 'left' ? -this.opts.margin.left : 0)
        .attr('y', this.opts.yaxis.textMarginTop);
      this.svg.select('.yaxis .domain').remove();
    }

    // // Axis ticks texts
    if (this.opts[p.axis][orient].label) {
      this._setLabel(axisG, this.opts[p.axis][orient].label, orient);
    }
  },

  _setXDomainFullwidth: function() {
    this.svg.selectAll('.xaxis .domain')
      .attr('d', 'M{0},0V0H{1}V0'.format(-this.opts.margin.left, this.opts.fullWidth));
  },

  _setYGrid: function() {
    this.svg.select('.yaxis')
      .selectAll('line')
        .attr('x1', this.opts.yaxis.fullGrid ? -this.opts.margin.left : 0)
        .attr('x2', this.opts.yaxis.fullGrid ? this.opts.width + this.opts.margin.right : this.opts.width)
        // add zeroline class
        .each(function(d) {
          if (d !== 0) {return;}
          d3.select(this).attr('class', 'zeroline');
        });    
  },

  _setLabel: function(axisG, label, orient) {
    // 'top' Not supported right now
    if (orient === 'top') {return;}
    var params = {
      'bottom': {
        x: 0 - this.opts.margin.left,
        y: this.opts.margin.bottom -7,
        textAnchor: 'start'
      },
      'left': {
        x: -this.opts.margin.left,
        y: this.opts.yaxis.textMarginTop - 20,
        textAnchor: 'start'
      },
      'right': {
        x: 0,
        y: this.opts.yaxis.textMarginTop - 20,
        textAnchor: 'end'
      }
    };

    var p = params[orient];

    axisG.append('text')
      .attr('class', 'label')
      .attr('x', p.x)
      .attr('y', p.y)
      .attr('text-anchor', p.textAnchor)
      .text(label);
  },

  getScopeParams: function() {
    return {};
  }

});