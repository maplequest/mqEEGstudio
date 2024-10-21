
var importers = [];

function runImporter(idx) {
  if (importers[idx][3]) 
    importers[idx][3](); 
  else mqLoadFile(function (fname,abdata) {
    importers[idx][1](fname,abdata);
    refreshPlots();
  },importers[idx][2]);
}

function makeImporterCB(idx) {
  return function () { runImporter(idx); }
}

function addImporter(importer) {
  importers.push(importer);
  var idx = importers.length - 1;
  desktop.menubar.deleteSubmenu('mb-import',importer[0]);
  desktop.menubar.addSubmenu('mb-import', { label: importer[0], hook: makeImporterCB(idx)});
  desktop.menubar.sortSubmenu('mb-import');
}

function initImporters () {
  mqAjaxJSDir(mqVersion+'/importers');
}

