var p_axes = ['svg', 'xscale','yscale', 'opts', function(svg, xscale, yscale, opts) {

  function setAxis(orient) {
    var params = {
      'bottom': {
        axis: 'xaxis',
        translate: h_getTranslate(0, opts.height),
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
        translate: h_getTranslate(opts.width + opts.margin.right, 0),
        textAnchor: 'end'
      }
    };

    var p = params[orient];

    // Set axis
    var axis =  d3.svg.axis()
      .scale(p.axis === 'xaxis' ? xscale : yscale)
      .orient(orient)
      .tickFormat(opts[p.axis][orient].tickFormat);

    if (opts[p.axis].ticks) {
      axis.ticks.apply(this, opts[p.axis].ticks);
    }

    // Draw axis
    var axisG = svg.append('g')
      .attr('class', p.axis + ' ' + orient)
      .attr('transform', p.translate)
      .call(axis);

    // Axis ticks texts
    var axisGTexts = axisG.selectAll('text');
    axisGTexts.style('text-anchor', p.textAnchor);

    if (p.axis === 'yaxis') {
      axisGTexts
        .attr('x', orient === 'left' ? -opts.margin.left : 0)
        .attr('y', opts.yaxis.textMarginTop);
      svg.select('.yaxis .domain').remove();
    }

    // Axis ticks texts
    if (opts[p.axis][orient].label) {
      setLabel(axisG, opts[p.axis][orient].label, orient);
    }
  }

  function setLabel(axisG, label, orient) {
    // 'top' Not supported right now
    if (orient === 'top') {return;}
    var params = {
      'bottom': {
        x: 0 - opts.margin.left,
        y: opts.margin.bottom -7,
        textAnchor: 'start'
      },
      'left': {
        x: -opts.margin.left,
        y: opts.yaxis.textMarginTop - 20,
        textAnchor: 'start'
      },
      'right': {
        x: 0,
        y: opts.yaxis.textMarginTop - 20,
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
  }
  
  function setXDomainFullwidth() {
    svg.selectAll('.xaxis .domain')
      .attr('d', 'M{0},0V0H{1}V0'.format(-opts.margin.left, opts.fullWidth));
  }

  function setYGrid() {
    svg.select('.yaxis')
      .selectAll('line')
        .attr('x1', opts.yaxis.fullGrid ? -opts.margin.left : 0)
        .attr('x2', opts.yaxis.fullGrid ? opts.width + opts.margin.right : opts.width)
        // add zeroline class
        .each(function(d) {
          if (d !== 0) {return;}
          d3.select(this).attr('class', 'zeroline');
        });
  }

  // render first yaxis so the xaxis domain os on top
  opts.yaxis.left.enabled && setAxis('left');
  opts.yaxis.right.enabled && setAxis('right');
  opts.xaxis.top.enabled && setAxis('top');
  opts.xaxis.bottom.enabled && setAxis('bottom');

  if (opts.yaxis.left.enabled || opts.yaxis.right.enabled) {
    setYGrid();
  }

  if (opts.xaxis.top.enabled || opts.xaxis.bottom.enabled) {
    setXDomainFullwidth();
  }
}];