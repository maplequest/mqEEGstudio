
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
        [ "Select All", function () {
             desktop.menubar.checkSubmenus('mb-waveforms',function (i) { return (i>1?true:false); });
             refreshPlots(); }
        ],
        [ "Select None", function () {
            desktop.menubar.checkSubmenus('mb-waveforms',function (i) { return false; });
            refreshPlots(); }
        ]
      ]
    },
    {
      "id": "mb-trends",
      "label": "Trends",
      "entries": [
        [ "Select All", function () { 
             desktop.menubar.checkSubmenus('mb-trends',function (i) { return (i>1?true:false); });
             refreshPlots(); } 
        ],
        [ "Select None", function () { 
            desktop.menubar.checkSubmenus('mb-trends',function (i) { return false; });
            refreshPlots(); } 
        ]
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
        [ "Plugin Manager..", pluginManagerLauncher ],
        [ "Install custom plugin..", function () { mqLoadJS("*.plugin",addPlugin); } ],
      ]
    }, {
      "id": "mb-help",
      "label": "Help",
      "entries": [
      [ "MapleQuest YouTube..", function () { launch('https://www.youtube.com/@MapleQuestLabs'); } ],
      [ "MapleQuest GitHub..", function () { launch('https://github.com/maplequest?tab=repositories'); } ],
      [ "About " + mqTitle,  function () { initSplash(true); } ]
     //   [ "GitHub Source & Docs..", function () { window.open('https://github.com/maplequest/mqEEGstudio'); }],
     //   [ "API Docs..", function () { window.open('https://docs.maplequestlabs.com'); }],
     //   [ "About EEGStudio..", helpAbout],
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
        tmp.push( [ lbl, makeChannelSetter(eegs[i],lbl),(i==0?true:false) ]);
      }
      tmp.sort(function (a,b) {
        return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
      });
      desktop.menubar.setSubmenus('mb-channels',tmp);
      signalbase.setCurChannel( eegs[0] );
      var trends = signalbase.trendChannels();
      tmp = desktop.menubar.getSubmenus('mb-trends').slice(0,2);
      var tmp2 = [];
      for (var i=0;i<trends.length;i++) {
        var lbl = signalbase.data.labels[trends[i]];
        tmp2.push([lbl,makeTrendSetter(lbl),true]);
      }
      desktop.menubar.setSubmenus('mb-trends',tmp.concat(tmp2.sort(function (a,b) {
        return a[0].toLowerCase().localeCompare(b[0].toLowerCase()); })));

      var waveforms = signalbase.waveformChannels();
      tmp = desktop.menubar.getSubmenus('mb-waveforms').slice(0,2);
      var tmp2 = [];
      for (var i=0;i<waveforms.length;i++) {
        var lbl = signalbase.data.labels[waveforms[i]];
        tmp2.push([lbl,makeWaveformSetter(lbl),true]);
      }
      desktop.menubar.setSubmenus('mb-waveforms',tmp.concat(tmp2.sort(function (a,b) {
        return a[0].toLowerCase().localeCompare(b[0].toLowerCase()); })));

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
  initPlugins();

  initSplash();
  setTimeout(function () {
    mqAjaxBinary(mqVersion+'/demo.edf', 
      function (data) { signalbase.loadEDFData("demo.edf",data); }, false, false);
   },2000);
 
  // this prevents hover near edges from making window shift
  mqSet('mq-root','overflow','clip'); 
}

window.addEventListener( 'load', boot );

