Chart.prototype.addSerie = function(serie) {
  if (serie.type === 'line') {
    this.$scope.lines = this.call(p_line).drawLine(serie);
  } else if (serie.type === 'bar') {
    this.$scope.bars = this.call(p_bar).drawBar(serie);
  } else if (serie.type === 'stacked-bar') {
    this.$scope.stackedBars = this.call(p_stacked_bar).drawBar(serie);
  }
};