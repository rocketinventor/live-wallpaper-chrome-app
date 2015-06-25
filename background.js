function dataURLtoBlob(dataURL) {
    var byteString = atob(dataURL.split(',')[1]),
        mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    var blob = new Blob([ia], {type: mimeString});
    return blob;
}

var localStream;

chrome.app.runtime.onLaunched.addListener(function() {

  navigator.webkitGetUserMedia({video: true},
      function(stream) {

    localStream = stream;
    chrome.notifications.create('id', {
      buttons: [{title: 'Stop'}],
      iconUrl: chrome.runtime.getURL('128.png'),
      message: '',
      title: 'Abracadabra!',
      type: 'basic',
    }, function() {

      var video = document.createElement('video');
      video.autoplay = true;
      video.src = URL.createObjectURL(localStream);
      video.addEventListener('loadedmetadata', function() {
  
        var canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        (function draw() {
          canvas.getContext('2d').drawImage(video, 0, 0);
          var blob = dataURLtoBlob(canvas.toDataURL()); 
          var xhr = new XMLHttpRequest();
          xhr.responseType = 'arraybuffer';
          xhr.open('GET', URL.createObjectURL(blob));
          xhr.onload = function() {
            chrome.wallpaper.setWallpaper({
              data: xhr.response,
              layout: 'STRETCH',
              filename: 'webcam',
  	    }, draw);
          }
          xhr.send();
        })();
      });
    });
  }, function(error) {});
});

chrome.notifications.onButtonClicked.addListener(stop);
chrome.notifications.onClosed.addListener(stop);

function stop() {
  chrome.notifications.clear('id', function() {
    localStream.stop();
    window.close(); // Close background page.
  });
}

