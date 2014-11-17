Chart.defaults = {
  margin: '0,0,0,0',
  trail: false,
  // Series options.
  series: {
    barWidth: 12,
    stackedBarAlign: 'right'
  },
  // Xaxis Options.
  xaxis: {
    scale: 'time',
    fit: false,
    ticks: false,
    top: {
      enabled: false,
      label: false,
      tickFormat: function(d) {return d;}
    },
    bottom: {
      enabled: true,
      label: false,
      tickFormat: function(d) {return d.getMonth();}
    }  
  },
  // Yaxis Options.
  yaxis: {
    scale: 'linear',
    fit: false,
    fullGrid: true,
    textMarginTop: 0,
    ticks: false,
    left: {
      enabled: true,
      label: false,
      tickFormat: function(d) {return d;}
    },
    right: {
      enabled: false,
      label: false,
      tickFormat: function(d) {return d;}
    }
  }
};