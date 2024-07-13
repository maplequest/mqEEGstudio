
var filters = [
];

function filterDialog(cfg) {
  var w = 264;
  var h = 32*cfg.params.length + 2*32;
  var wnd = mqWindow({ id: cfg.id, title: cfg.title, width: w+'px', height: h+'px' });
  var y = 32;
  for (var i=0;i<cfg.params.length;i++) {
     var param = cfg.params[i];
     mqAppend(wnd,mqLabel({ x: '8px', y: y+'px', label: param.label, align: 'right'}));
     mqAppend(wnd,mqInput({ id: param.id, x: '136px', y: y+'px', value: param.value }));
     y+=32;
  }
  mqAppend(wnd,mqButton({
      id: cfg.id+'-apply',
      x: '136', y: y+'px', label: 'Apply',
      onclick: cfg.onapply
  }));
  mqAppend(wnd,mqButton({
      id: cfg.id+'-reset',
      x: '8px', y: y+'px', label: 'Reset',
      onclick: cfg.onreset
  }));
}

// apply filter first forward, then reverse to cancel out phase and delay
function filterEEGFast(fltmaker) {
//  var chs = [signalbase.curChannel,signalbase.curChannelB];
  var chs = signalbase.eegChannels();
  for (var j=0;j<chs.length;j++) {
    var ch = chs[j];
    var fs = signalbase.data.srates[ch];
    var flt = fltmaker(fs);
    var src = signalbase.data.signals[ch];
    var tgt = Array(src.length);
    for (var i=0;i<10*fs;i++) flt.step(src[0]);
    for (var i=0;i<src.length;i++) tgt[i]=flt.step(src[i]);
    for (var i=0;i<10*fs;i++) flt.step(tgt[src.length-1]);
    for (var i=src.length-1;i>=0;i--) src[i]=flt.step(tgt[i]);
  }
}

function applyFilter(idx) {
  if (filters[idx][1]()) refreshPlots();
}

function makeFilterCB(idx) {
  return function () { applyFilter(idx); }
}

function addFilter(flt) {
  filters.push(flt);
  var idx = filters.length - 1;
  desktop.menubar.deleteSubmenu('mb-filters',flt[0]);
  desktop.menubar.addSubmenu('mb-filters',[flt[0], makeFilterCB(idx)]);
  desktop.menubar.sortSubmenu('mb-filters');
}

function initFilters () {
  mqAjaxJSDir(mqVersion+'/filters');
}

