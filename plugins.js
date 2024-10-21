
var plugins = [];

function removePlugin(name) {
  var res = [];
  for (var i=0;i<plugins.length;i++) 
    if (plugins[i]['name']!=name) res.push(plugins[i]);
  mqStorageSetJSON('eegstudio-plugins',res);
  plugins=res;
}

function addPlugin(plg, silent) {
  var name = plg.name;
  removePlugin(name);
  plugins.push(plg);
  mqStorageSetJSON('eegstudio-plugins',plugins);
  if (!silent) mqDialogOK({
     title: 'Plugin Installed',
     label: name + ' has been installed. You can uninstall it later from the Plugin Manager.',
  });
}

function removePluginAsk(name) {
  mqDialogOK( {
    title: 'Confirm Plugin Removal',
    label: 'Click OK to confirm removal of ' + name +'. This action cannot be undone.',
    onclick: function () { removePlugin(name); }
  });
}

function initPlugins() {
  plugins = mqStorageGetJSON('eegstudio-plugins',[]);
  initPluginManager(); 
}

function clearPlugins() {
  mqStorageSetJSON('eegstudio-plugins',[]);
  plugins=[];
}

