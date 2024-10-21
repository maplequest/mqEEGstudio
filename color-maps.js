
var palette = new mqPalette('Jet');

var curColorMap = 'Jet';

var colorMaps = [];

function highlightColorMap() {
 var lbl = curColorMap;
 if (!colorMaps.map((cm)=>cm[0]).includes(lbl)) {
   lbl='Jet';
   curColorMap='Jet';
   mqStorageSetString('colormap',curColorMap);
 }
 desktop.menubar.radioSubmenu('mb-colormaps',lbl);
}

function setColorMap(name) {
  var i=0;
  for (i=0;i<colorMaps.length;i++) {
    if (colorMaps[i][0]==name) break;
  }
  curColorMap = name;
  highlightColorMap();
  mqStorageSetString('colormap',name);
  palette.scale=colorMaps[i][1];
  palette.dx=1.0/(palette.scale.length-1);
  refreshPlots();
}

function addColorMap (cm) {
  colorMaps.push(cm);
  desktop.menubar.deleteSubmenu('mb-colormaps',cm[0]);
  desktop.menubar.addSubmenu('mb-colormaps', { label: cm[0], hook: function () { setColorMap(cm[0]); } });
  desktop.menubar.sortSubmenu('mb-colormaps');
  var idx = colorMaps.length - 1;
  if (cm[0]==curColorMap) {
    palette.scale=colorMaps[idx][1];
    palette.dx=1.0/(palette.scale.length-1);
  }
}

function expandColors (cs) {
  var res = [];
  var len = cs.length + 0.0;
  for (var i=0;i<len;i++) { 
    res.push(cs[i].map(function (x) { return 256*x; }));
  }
  return res;
}

function initColorMaps() {
  curColorMap = mqStorageGetString('colormap','Jet');
  mqAjaxJSDir(mqVersion+'/color-maps',function () { highlightColorMap(); });
}

