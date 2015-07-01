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

function stop() {
  chrome.notifications.clear('id');
  window.close(); // Close background page.
}

chrome.app.runtime.onLaunched.addListener(function videoWall() {
  chrome.notifications.create('id', {
    buttons: [{title: 'Stop'}],
    iconUrl: chrome.runtime.getURL('128.png'),
    message: "Your live wallpaper is up and running, close this to stop!",
    title: 'Abracadabra!',
    type: 'basic',
  }, function() {
      var video = document.createElement('video');
      video.id = "video";
      video.autoplay = true;
      video.src = "/vids/TimeScapes_360p.mp4";
      video.loop = "true";
      video.addEventListener('loadedmetadata', function() {
      var canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.id = "canvas";
    }, function draw() {
        canvas = document.getElementsByClassName('canvas')[0];
        canvas.getContext('2d').drawImage(video, 0, 0);
        var blob = dataURLtoBlob(canvas.toDataURL()); 
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';
        xhr.open('GET', URL.createObjectURL(blob));
        xhr.onload = function() {
          chrome.wallpaper.setWallpaper({
            data: xhr.response,
            layout: 'STRETCH',
            filename: 'video_frame',
          });
        };
        xhr.send();
      });
  });
});



chrome.notifications.onButtonClicked.addListener(stop);
chrome.notifications.onClosed.addListener(stop);


