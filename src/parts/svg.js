var p_svg = ['opts', function(opts) {

  function drawSvg() {
    return d3.select(opts.target)
      .append('svg')
        .attr('width', opts.responsive ?  '100%' : opts.fullWidth)
        .attr('height', opts.fullHeight)
      .append('g')
        .attr('class', 'g-main')
        .attr('transform', opts.gmainTranslate);
  }

  var svg = drawSvg();

  return {svg: svg};
}];