
var desktop;

function launch(url) { window.open(url,"_blank"); }

var menu =  [
       {
         "id": "mb-import",
         "label": "Import",
         "entries": [ ]
       },
       {
         "id": "mb-plotters",
         "label": "Plots",
         "entries": [ ]
       },
       {
         "id": "mb-channels",
         "label": "CDSA",
         "entries": [ ]
       },
    {
      "id": "mb-waveforms",
      "label": "Waveforms",
      "entries": [
        { label: "Select All", hook: function () {
             desktop.menubar.checkSubmenus('mb-waveforms',function (i) { return (i>1?true:false); });
             refreshPlots(); }
        },
        { label: "Select None", hook: function () {
            desktop.menubar.checkSubmenus('mb-waveforms',function (i) { return false; });
            refreshPlots(); }
        }
      ]
    },
    {
      "id": "mb-trends",
      "label": "Trends",
      "entries": [
        { label: "Select All", hook: function () { 
             desktop.menubar.checkSubmenus('mb-trends',function (i) { return (i>1?true:false); });
             refreshPlots(); } 
        },
        { label: "Select None", hook: function () { 
            desktop.menubar.checkSubmenus('mb-trends',function (i) { return false; });
            refreshPlots(); } 
        }
      ]
    }, 
       {
         "id": "mb-filters",
         "label": "Filters",
         "entries": [ ]
       }, 
    {
         "id": "mb-colormaps",
         "label": "ColorMaps",
         "entries": [ ]
    }, 
    {
      "id": "mb-algorithms",
      "label": "Algorithms",
      "entries": [ ]
    }, {
      "id": "mb-tools",
      "label": "Tools",
      "entries": [ ]
    }, {
      "id": "mb-export",
      "label": "Export",
      "entries": [
      ]
    },
    {
      "id": "mb-plugins",
      "label": "Plugins",
      "entries": [
        { label: "Plugin Manager..", hook: pluginManagerLauncher },
        { label: "Install custom plugin..", hook: function () { 
            mqLoadJS("*.plugin", function (name, code) {
              addPlugin({
                name: name, 
                data: btoa(code), 
                metadata: btoa('Custom plugin'), 
                level: 0, 
                version: "0.0.0"
              });
            }); } },
      ]
    }, {
      "id": "mb-help",
      "label": "Help",
      "entries": [
       { label: "MapleQuest YouTube..", hook: function () { launch('https://www.youtube.com/@MapleQuestLabs'); } },
       { label: "MapleQuest GitHub..", hook: function () { launch('https://github.com/maplequest?tab=repositories'); } },
       { label: "MapleQuest Terms of Use..", hook: mqTermsOfUseUI },
       { label: "MapleQuest Privacy Policy..", hook: mqPrivacyPolicyUI },
       { label: "About " + mqTitle + '..', hook: function () { mqSplashUI({border: true}); } },
      ]
    }, 
  
 ];

var logTimeout;

function initDesktop() {
  function makeLogWrapper (oldfun,color) {
    return function () {
      var msg = [];
      var n = arguments.length;
      for (var i=0;i<n;i++) msg.push(''+arguments[i]);
      desktop.statusbar.setColor(4,color);
      desktop.statusbar.set(4,msg.join(' '));
      if (logTimeout) clearTimeout(logTimeout);
      logTimeout = setTimeout(function () { desktop.statusbar.set(4,''); }, 20000); 
      return oldfun.apply(undefined, arguments);
    }
  }
  desktop = new mqDesktop({ "mq-entries": menu });
  mqAppend(desktop.widget,mqMakeWidget({
    tag: 'img',
    src: mqVersion+'/icons/spinner.gif',
    id:  'working',
    height: '16px',
    position: 'absolute',
    right: '4',
    bottom: '4',
    display: 'none'
  }));
  mqAppend('mq-root',desktop.widget);
  mqSet('desktop','border-top','5px solid #729f88');

//  desktop.statusbar.set(4,mqTitle + ' ' + mqVersion );
  desktop.statusbar.setTooltip(1,'Current file name');
  desktop.statusbar.setTooltip(2,'Timestamp (DD.MM.YY HH:MM:SS)');
  desktop.statusbar.setTooltip(3,'Duration (HH:MM:SS) SampleRate Resolution');
  desktop.statusbar.setTooltip(4,'System log message');
  console.log = makeLogWrapper(console.log,mqPal(0.5).hex());
  console.error = makeLogWrapper(console.error,'red');
  console.warn = makeLogWrapper(console.warn,'orange');
  console.log(mqTitle + ' ' + mqVersion);
}

var signalbase;

var cdsaDbMin = -80;
var cdsaDbMax = 0;

function updateCDSAconfig () {
  var v1 = parseFloat(mqElement('cdsa-config-min').innerText);
  var v2 = parseFloat(mqElement('cdsa-config-max').innerText);
  if (mqNaN(v1)||mqNaN(v2)||v1>=v2||v1<-120||v2>12) {
    mqDialogOK({ title: "Invalid Range", label: "Invalid CDSA scale range" });
  } else {
    cdsaDbMin=v1;
    cdsaDbMax=v2;
    refreshPlots();
   // mqDelete('cdsa-config-window');
  }
}

function configCDSA () {
  mqParamDialog({
    id: 'cdsa-config',
    title: 'CDSA Scale Config',
    params: [
      { 
        subid: '-max',
        label: 'Scale Max [dB]',
        value: cdsaDbMax
      },
      { 
        subid: '-min',
        label: 'Scale Min [dB]',
        value: cdsaDbMin
      } 
    ],
    rightbutton: {
      label: 'Apply',
      onclick: updateCDSAconfig
    },
    leftbutton: {
      label: 'Default',
      onclick: function () { 
        cdsaDbMin=-80; 
        cdsaDbMax=0;
        mqElement('cdsa-config-min').innerText = cdsaDbMin+'';
        mqElement('cdsa-config-max').innerText = cdsaDbMax+'';
        refreshPlots();
      } 
    }
  });
}
     
function initSignalBase () {
  function makeChannelSetter(idx,lbl) {
    return function () {
      signalbase.setCurChannel(idx);
      desktop.menubar.radioSubmenu('mb-channels',lbl);
      refreshPlots();
    }
  }
  function makeTrendSetter(lbl) {
    return function () {
      desktop.menubar.toggleSubmenu('mb-trends',lbl);
      refreshPlots();
    }
  }
  function makeWaveformSetter(lbl) {
    return function () {
      desktop.menubar.toggleSubmenu('mb-waveforms',lbl);
      refreshPlots();
    }
  }
  signalbase = new SignalBase({
    "onafterload": function () {
      var eegs = signalbase.eegChannels();
      var tmp = [];
      for (var i=0;i<eegs.length;i++) {
        var lbl = signalbase.data.labels[eegs[i]];
        tmp.push( { label: lbl, hook: makeChannelSetter(eegs[i],lbl), selected: (i==0?true:false) });
      }
      tmp.sort(function (a,b) {
        return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
      });
      desktop.menubar.setSubmenus('mb-channels',
        [{ label: 'Config..', hook: configCDSA  }].concat(tmp));
      signalbase.setCurChannel( eegs[0] );
      var trends = signalbase.trendChannels();
      tmp = desktop.menubar.getSubmenus('mb-trends').slice(0,2);
      var tmp2 = [];
      for (var i=0;i<trends.length;i++) {
        var lbl = signalbase.data.labels[trends[i]];
        tmp2.push({ label: lbl, hook: makeTrendSetter(lbl),selected: true });
      }
      desktop.menubar.setSubmenus('mb-trends',tmp.concat(tmp2.sort(function (a,b) {
        return a.label.toLowerCase().localeCompare(b.label.toLowerCase()); })));

      var waveforms = signalbase.waveformChannels();
      tmp = desktop.menubar.getSubmenus('mb-waveforms').slice(0,2);
      var tmp2 = [];
      for (var i=0;i<waveforms.length;i++) {
        var lbl = signalbase.data.labels[waveforms[i]];
        tmp2.push({ label: lbl, hook: makeWaveformSetter(lbl), selected: true } );
      }
      desktop.menubar.setSubmenus('mb-waveforms',tmp.concat(tmp2.sort(function (a,b) {
        return a.label.toLowerCase().localeCompare(b.label.toLowerCase()); })));

      desktop.statusbar.set(1,signalbase.data.filename);
      desktop.statusbar.set(2,signalbase.data.startdate + ' ' + 
               signalbase.data.starttime.replace(/\./g,':'));
    },
    "onchange": function () {
      desktop.statusbar.set(3, 
        mqElapsedString(signalbase.duration()) + ' ' +
        Math.round(10*Math.max(...signalbase.data.srates))/10.0 + 'Hz ' +
        Math.round(10*Math.max(...signalbase.data.bits))/10.0 + 'Bit'
      );
      refreshPlots();
    }
  });
}

function boot() {
  mqInit({
   "pal-scale": ['#171923','#ffffff'],
   "pal-domain": [1,0]
  });
  initDesktop();
  initSignalBase();
  initColorMaps();
  initImporters();
  initHover();
  initPlotters();
  initFilters();
  initAlgorithms();
  initTools();
  initExporters();
  initContextMenu();
  initPlugins();

  mqSplashUI();
  setTimeout(function () {
    mqAjaxBinary(mqVersion+'/demo.edf', 
      function (data) { signalbase.loadEDFData("demo.edf",data); }, false, false);
   },2000);
 
  // this prevents hover near edges from making window shift
  mqSet('mq-root','overflow','clip'); 
}

window.addEventListener( 'load', boot );

