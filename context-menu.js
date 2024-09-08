
var contextX = 0;
var contextY = 0;
var contextAt = 0;
var contextDrug="";

var contextmenu = [
  [ "Add annotation.." , addAnnotationUI ],
  [ "Remove annotation" , removeAnnotation ]
];

function contextMenuUI () {
  if (!hoverValid()) return;
  var id = 'contextmenu';
  mqDelete(id+'-dropdown');
  contextX=hoverX;
  contextY=hoverY;
  contextAt=hoverAt;
  contextDrug=hoverPlot.id.slice(8);
  var x=hoverX;
  var y=hoverY;
  hoverHide=1;
  var content = mqMakeWidget({
    "tag": 'div',
    "id": id + '-dropdown',
    "position": "absolute",
    "top": (y-0) + 'px',
    "left": (x-0) + 'px',
    "z-index": "100",
    "min-width": "150px",
    "max-height": "350px",
    "overflow-x": "hidden",
    "overflow-y": "auto",
    "white-space": "nowrap",
    "background": mqPal(0.1).hex(),
    "class": "mq-dropdown",
    "box-shadow": "0px 2px 4px 0px " + mqPal(1.0).hex()
  });
  function makeSetter(i) {
    return function () { 
      contextmenu[i][1]();
      hoverHide=0;
    }
  }
  for (var i=0;i<contextmenu.length;i++) {
    var o = mqMakeWidget({
      "tag": 'div',
      "id": id + '-dropdown-' + i,
      "float": "none",
      "text-decoration": "none",
      "text-align": "left",
      "width": "calc(100% - 7px)",
      "padding-left": "5px",
      "class": "mq-menubar-hover",
      "border": "1px solid transparent",
      "user-select": "none",
      "innerHTML": contextmenu[i][0],
      "cursor": "pointer",
      "onclick": makeSetter(i)
    });
    mqAppend(content,o);
  }
  mqAppend('mq-root',content);
  var w = mqWidth(content);
  var w0 = window.innerWidth;
  if (x+w>w0) mqSet(content,'left',(w0-w)+'px');
  var h = mqHeight(content);
  var h0 = window.innerHeight;
  if (y+h>h0) mqSet(content,'top',(h0-h)+'px');
  hoverFindAnnotation();
  annotationAt = hoverAt;
  annotationIdx = hoverAnnotation;
  mqSet('hover-plot','display','none');
  for (var i=0;i<plots.length;i++) plots[i].hover(0);
}

function initContextMenu () {
  if (document.addEventListener) {
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    }, false);
  } else {
    document.attachEvent('oncontextmenu', function() {
      window.event.returnValue = false;
    });
  }
}

