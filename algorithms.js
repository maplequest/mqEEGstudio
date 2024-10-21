
var algorithms = [
];

function refreshTrends (newtrends) {
  function makeTrendSetter(lbl) {
    return function () {
      desktop.menubar.toggleSubmenu('mb-trends',lbl);
      refreshPlots();
    }
  }
  var trends = signalbase.trendChannels();
  var len = desktop.menubar.getSubmenus('mb-trends').length-2;
  for (var i=len;i<trends.length;i++) {
    var lbl = signalbase.data.labels[trends[i]];
    desktop.menubar.addSubmenu('mb-trends',{label: lbl, hook: makeTrendSetter(lbl), selected: true});
  }
  var subs = desktop.menubar.getSubmenus('mb-trends');
  desktop.menubar.setSubmenus('mb-trends',[subs[0],subs[1]].concat(
    subs.slice(2).sort(function(a,b) {
      return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
    })));
  if (newtrends) {
    for (var i=0;i<newtrends.length;i++) {
      desktop.menubar.checkSubmenu('mb-trends',newtrends[i]);
    }
    refreshPlots();
  }
}

function applyAlgorithm(idx) {
  var newtrends = algorithms[idx][1]();
  refreshTrends(newtrends);
}

function makeAlgorithmCB(idx) {
  return function () { 
    applyAlgorithm(idx); 
  }
}

function addAlgorithm(algo) {
  algorithms.push(algo);
  var idx = algorithms.length - 1;
  desktop.menubar.deleteSubmenu('mb-algorithms',algo[0]);
  desktop.menubar.addSubmenu('mb-algorithms',{ label: algo[0], hook: makeAlgorithmCB(idx) });
  desktop.menubar.sortSubmenu('mb-algorithms');
}

function initAlgorithms () {
  mqAjaxJSDir(mqVersion+'/algorithms');
}

