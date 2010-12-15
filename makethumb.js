function makeThumb(obj) {
  var videoPath = obj.src,
      thumbEl   = $(obj.thumbSelector),
      thumbH    = obj.height,
      thumbW    = obj.width,
      numSegs   = obj.numFrames,
      staticImg = obj.static;
    
  
  //create id
  var id = 'thumbCanvas'+Math.floor(Math.random()*9999999);
  //append canvas
  thumbEl.append('<canvas id="'+id+'"></canvas>');
  //get canvas and set width/height
  var canvas = document.getElementById(id);
  canvas.height = thumbH;
  canvas.width = thumbW;
  
  thumbEl.css('width', thumbW+'px');
  thumbEl.css('height', thumbH+'px');
  thumbEl.css('background', 'url('+staticImg+')');
  
  //get the canvas context
  var context = canvas.getContext('2d');
  
  //add the video to the page (hidden)
  var v = document.createElement('video');
  v.src = videoPath;
  v.id = 'vid'+id;
  v.style.display = "none";
  $('body').append(v)
  v.volume = 0;
  v = document.getElementById('vid'+id);
  
  
  
  //set up the hover event
  var stopCycle = true;
  $(thumbEl).hover(function() {
    stopCycle = false;
    //get the interval for each frame
    var interval = Math.floor(v.duration/numSegs);
    //do the load and the draw
    load(v, context, thumbW, thumbH, interval);
    draw(v, context, thumbW, thumbH, interval);
  }, function() {
    //on hover out stop the draw
    stopCycle = true;
  });
  
  
  var count = 0;
  var thumbs = [];
  function draw(v,c,w,h, interval) {
    //break if they hovered off
    if (stopCycle) return false;
    //load the img from the cache and render it to the canvas
    if (thumbs[count]) {
      c.putImageData(thumbs[count],0,0);
      count++;
    }
    //if we would be over the duration, or we haven't cached the image yet
    if (count*interval >= v.duration || !thumbs[count]) {
      //cycle back to the beginning
      count = 0; 
    }
    //calls self
    setTimeout(draw,obj.duration,v,c,w,h, interval);
  }
  
  
  var loadCount = 0;
  function load(v,c,w,h, interval) {
    //if they hovered off, or we have all the thumbs, return
    if (numSegs == thumbs.length || stopCycle) return false;
    //otherwise, set the video to the correct frame         
    if (loadCount == 0) v.currentTime = obj.minOffset || 0
    else v.currentTime = (loadCount*interval);
    //increment for the next frame to show
    loadCount++;
    if (loadCount*interval >= v.duration) {
      //go to the beginning if we are over the duration
      loadCount = 0; 
    }
    //calls self
    setTimeout(load,obj.duration,v,c,w,h, interval);
  }
  
  //generate the canvas used for caching the images
  $('body').prepend('<canvas id="load'+id+'"></canvas>')
  var loadcanvas = document.getElementById('load'+id);
  loadcanvas.height = thumbH;
  loadcanvas.width = thumbW;
  loadcanvas.style.display = 'none';
  var loadcontext = loadcanvas.getContext('2d');
  
  //when the video has loaded a frame
  v.addEventListener("timeupdate", function() {
    //draw and cache the image
    loadcontext.drawImage(v,0,0,thumbW,thumbH);
    thumbs.push(loadcontext.getImageData(0,0,thumbW,thumbH))
    //console.log('cached'+thumbs.length);
  }, false);
}