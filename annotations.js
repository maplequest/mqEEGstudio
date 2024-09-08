
var annotationAt = null;
var annotationIdx = null;

function annotationUI (lbl,cb,def="") {
  mqDelete('annotation-window');
  var h = 64;
  var w = 2*120 + 3*8;
  var x,y;
  var wnd = mqWindow({
    id: 'annotation',
    title: lbl,
    width: w+'px', height: h+'px',
    onclose: function () { }
  });
  x=8;
  y=32;
  mqAppend(wnd,mqInput({
    id: 'annotation-text',
    x: x+'px',
    y: y+'px',
    width: (w-16)+'px',
    value: def,
    onenter: function () {
      cb();
      mqDelete('annotation-window');
    }
  }));
  mqElement('annotation-text').focus()
}

function addAnnotationUI() {
  var def="";
  if (annotationIdx!=null) def = signalbase.data.annotations[annotationIdx][1];
  annotationUI("Add Annotation",function () {
    var txt = mqGet('annotation-text','innerText');
    if (txt=="") return;
    signalbase.annotate(txt,annotationAt);
    refreshPlots();
  },def);
}

function removeAnnotation () {
  if (annotationIdx!=null) {
    signalbase.data.annotations.splice(annotationIdx,1);
    annotationIdx=null;
    refreshPlots();
  }
}


