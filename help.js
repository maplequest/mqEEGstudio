
function helpAbout() {
  var objs = [];
  objs.push(mqMakeWidget({
    tag: 'div',
    id:  'about-label',
    'font-size': '24px',
    'font-weight': 'bold',
    'margin-bottom': '10px',
    'innerHTML': mqTitle + ' version ' + mqVersion,
  }));
  objs.push(mqMakeWidget({
    tag: 'div',
    id:  'about-description',
    'innerHTML':
`${mqTitle} is an Open Source project written by MapleQuest Innovations
to support the use of processed EEG monitors in anesthesia, particularly 
Total Intravenous Anesthesia (TIVA).

<p>${mqTitle} can also be used for visualization and processing of EEG from
other sources, such as brain-computer interfaces and conventional many-electrode monitors.

<p>${mqTitle} development is supported in part by the 2023 World Federation
of Societies of Anaesthesiologists (WFSA) Fresenius-Kabi Innovation Award
and the 2024 Society for Technology in Anesthesia Research Grant.

<p>If you are using ${mqTitle} in published research, please reference:
<br><b>Tung A, Petersen C, Merchant RN: EEGstudio: An Open-Source EEG
Analysis Platform Supporting Hypnotic Index Research. Proc. of the 18th World Congress
of Anaesthesiologists, March 2024</b>. 
`
  })); var wnd = mqWindow({
    id: 'about', title: 'About ' + mqTitle, width: '600px', height: '420px'
  }); mqSet(wnd,'padding','10px'); for (var i=0;i<objs.length;i++)
  mqAppend(wnd,objs[i]);
}

