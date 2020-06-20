function BufferLoader(context, urlList, callback, callbackDraw) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = [];
  this.loadCount = 0;
  this.drawSample = callbackDraw;
}

BufferLoader.prototype.loadBuffer = function (url, index) {
  // Load buffer asynchronously
  console.log('file : ' + url + "loading and decoding");

  var request = new XMLHttpRequest();
  request.open("GET", url, true);

  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function () {

    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function (buffer) {

        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;

        if(index == 0){
        // Let's draw this decoded sample
        loader.drawSample(buffer, index);
        }
        
        //console.log("In bufferLoader.onload bufferList size is " + loader.bufferList.length + " index =" + index);
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function (error) {
        console.error('decodeAudioData error', error);
      }
    );
  };

  request.onerror = function () {
    alert('BufferLoader: XHR error');
  };

  request.send();
};

BufferLoader.prototype.load = function () {
  // M.BUFFA added these two lines.
  this.bufferList = [];
  this.loadCount = 0;
  console.log("BufferLoader.prototype.load urlList size = " + this.urlList.length);
  for (var i = 0; i < this.urlList.length; ++i)
    this.loadBuffer(this.urlList[i], i);
};
