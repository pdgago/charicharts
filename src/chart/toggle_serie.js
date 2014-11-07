Chart.prototype.toggleSerie = function(serieId) {
  var el = this.$scope.svg.select('#serie' + serieId);
  if (el.empty()) {return;}
  var active = Number(el.attr('active')) ? 0 : 1;
  el.attr('active', active);

  el.transition()
    .duration(200)
    .style('opacity', el.attr('active'));
};
