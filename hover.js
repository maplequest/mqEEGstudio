
var hover;
var hoverCtx;
var hoverAt=null;
var hoverAtValue=null;
var hoverAtValueLast=null;
var hoverHide = 0;
var hoverAtTime;
var hoverAtLast;
var hoverX=0;
var hoverY=0;
var hoverInvert=null;
var hoverPlot=null;
var hoverAnnotation = null;

var hoverW = 224;
var hoverH = 55;

function clamp(v, vmin, vmax) { 
  if (v > vmax) { v = vmax; };
  return v < vmin ? vmin : v; 
};

function hoverFindAnnotation ( ) {
  var len = signalbase.data.annotations.length;
  var rge = signalbase.zoomEnd - signalbase.zoomBegin;
  var mindist = 0.001;
  hoverAnnotation=null;
  for (var i=0;i<len;i++)  {
    var ann =  signalbase.data.annotations[i];
    var dist = Math.abs(hoverAt - ann[0])/rge; 
    if (dist<mindist) {
      hoverAnnotation = i;
      mindist=dist;
    }
  }
}

function hoverLoop() {
   if (hoverHide!=0||hoverAt === null) { 
    mqSet('hover-plot','display','none');
   } else { 
     if (hoverAt!=hoverAtLast||hoverAtValue!=hoverAtValueLast) { 
       if (hoverPlot) {
         var str = mqElement('hover-label').value;
         hoverFindAnnotation();
         mqElement('hover-label').value = (hoverAnnotation!=null?signalbase.data.annotations[hoverAnnotation][2]:"");
         var render = hoverPlot.config['renderHover'];
         if (render) render();
         mqSet('hover-plot','display','block');
         mqSet('hover-plot','left', (hoverX - hoverW/2.0) + 'px');
         mqSet('hover-plot','top', (hoverY + 30) + 'px');
         mqElement('hover-label').focus(); 
         if (hoverAt!=hoverAtLast) mqElement('hover-label').select();
         hoverAtLast = hoverAt; 
         hoverAtValueLast = hoverAtValue; 
       }
     } 
   } 
   setTimeout(hoverLoop, 100); 
}

function initHover() {
  hover = mqMakeWidget({
    tag: 'div',
    "id": "hover-plot",
    "position": "absolute",
    "top": "0",
    "left": "0",
    "display": "none",
    "background": "white",
    "border": "1px solid white",
    "opacity": "0.75",
    "padding-bottom": "3px"
  });
  var hoverCanvas = mqMakeWidget({
    tag: 'canvas',
    "id": "hover-canvas",
    "margin": "0px"
  });
  mqAttr(hoverCanvas,'width', hoverW + '');
  mqAttr(hoverCanvas,'height', hoverH + '');
  var hoverForm = mqMakeWidget({
    tag: 'form',
    "id": "hover-form",
    "margin-top": "3px",
    "position": "relative"
  });
  var hoverInput = mqMakeWidget({
    tag: 'input',
    "id": "hover-label",
    "position": "absolute",
    "top": "-2px",
    "font-size": "14px", 
    "font-color": "black",
    "text-align": "center",
    "type": "text",
    "placeholder": "<Type to Annotate>",
    "outline": "0",
    "border": "0",
  });
  mqStyle(hoverInput,'width','100%');
  mqAppend(hoverForm,hoverInput);
  mqAppend(hover,hoverCanvas);
  mqAppend(hover,hoverForm);
  mqEvent(hoverForm,'submit',function (e) { e.preventDefault(); });
  mqAppend(hover);
  hoverCtx = hoverCanvas.getContext('2d');
  mqEvent(hoverInput,'keyup', function (e) {
    e.preventDefault();
    if (e.key === 'Enter') {
      var str = mqElement('hover-label').value;
      if (str.length>0) {
        if (hoverAnnotation!=null) {
          signalbase.data.annotations[hoverAnnotation][2]=str;
        } else {
          signalbase.annotate(str,hoverAt);
        }
      } else { 
         if (hoverAnnotation!=null) {
           signalbase.data.annotations.splice(hoverAnnotation,1);
         }
      }
      mqElement('hover-label').value = '';
      hoverAt=null;
      refreshPlots();
    }
  });
  hoverLoop();
}


