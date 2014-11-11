var p_svg = ['responsive', 'fullWidth', 'fullHeight', 'target', 'gmainTranslate',
  function(responsive, fullWidth, fullHeight, target, gmainTranslate) {
    var m = {};

    m.draw = function() {
      return d3.select(target)
        .append('svg')
          .attr('width', responsive ?  '100%' : fullWidth)
          .attr('height', fullHeight)
        .append('g')
          .attr('class', 'g-main')
          .attr('transform', gmainTranslate);
    };

    return m;
  }];