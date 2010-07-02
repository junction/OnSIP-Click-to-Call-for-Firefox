//
// Fade Anything Technique
//
onsip.Fat = {
  make_hex : function (r,g,b) 
  {
    r = r.toString(16); if (r.length == 1) r = '0' + r;
    g = g.toString(16); if (g.length == 1) g = '0' + g;
    b = b.toString(16); if (b.length == 1) b = '0' + b;
    return "#" + r + g + b;
  },

  fade_element : function (element, fps, duration, from, to, cleanup) 
  {
    if (!fps) fps = 30;
    if (!duration) duration = 1000;
    if (!from || from=="#") from = "#FFFF33";
    if (!to) to = this.get_bgcolor(element);
    if (!cleanup) cleanup = true;

    var frames = Math.round(fps * (duration / 1000));
    var interval = duration / frames;
    var delay = interval;
    var frame = 0;
    
    if (from.length < 7) from += from.substr(1,3);
    if (to.length < 7) to += to.substr(1,3);
    
    var rf = parseInt(from.substr(1,2),16);
    var gf = parseInt(from.substr(3,2),16);
    var bf = parseInt(from.substr(5,2),16);
    var rt = parseInt(to.substr(1,2),16);
    var gt = parseInt(to.substr(3,2),16);
    var bt = parseInt(to.substr(5,2),16);
    
    var r,g,b,h;
    while (frame < frames)
    {
      r = Math.floor(rf * ((frames-frame)/frames) + rt * (frame/frames));
      g = Math.floor(gf * ((frames-frame)/frames) + gt * (frame/frames));
      b = Math.floor(bf * ((frames-frame)/frames) + bt * (frame/frames));
      h = this.make_hex(r,g,b);
      
      setTimeout(this.makeTimer(element, h), delay);

      frame++;
      delay = interval * frame; 
    }

    if(cleanup)
      setTimeout(this.makeTimer(element, null), delay);
    else
      setTimeout(this.makeTimer(element, to), delay);
  },
  
  makeTimer : function(element, color) {
    if(color)
      return function() { onsip.Fat.set_bgcolor(element, color); }
    else
      return function() { onsip.Fat.remove_bgcolor(element); }
  },
  
  set_bgcolor : function (element, c)
  {
    element.style.backgroundColor = c;
  },
  
  remove_bgcolor : function (element)
  {
    element.style.removeProperty("background-color");
  },
  
  get_bgcolor : function (element)
  {
    while(element)
    {
      var c;
      if (window.getComputedStyle) c = window.getComputedStyle(element,null).getPropertyValue("background-color");
      if (element.currentStyle) { c = element.currentStyle.backgroundColor; }
      if ((c != "" && c != "transparent") || element.tagName == "BODY") { break; }
      element = element.parentNode;
    }
    if (c == undefined || c == "" || c == "transparent") c = "#FFFFFF";
    var rgb = c.match(/rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/);
    if (rgb) c = this.make_hex(parseInt(rgb[1]),parseInt(rgb[2]),parseInt(rgb[3]));
    return c;
  }
}

