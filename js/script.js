var isStreaming = false;
var videoElement = document.getElementById('videoElement');
var toggleButton = document.getElementById('toggleButton');

function init(){
    console.log("Inited");
    toggleButton.addEventListener('click', toggleVideostream);
}

function toggleVideostream() {
    if (!isStreaming) {
        // Check if getUserMedia is supported
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Request permission to access video and audio
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(function(stream) {
            // Attach the stream to the video element
            videoElement.srcObject = stream;
            toggleButton.textContent = 'Stop Videostream';
            isStreaming = true;
            })
            .catch(function(error) {
            console.log('Error accessing media devices:', error);
            });
        } else {
        console.log('getUserMedia is not supported');
        }
    } else {
        var stream = videoElement.srcObject;
        var tracks = stream.getTracks();

        tracks.forEach(function(track) {
        track.stop();
        });

        videoElement.srcObject = null;
        toggleButton.textContent = 'Start Videostream';
        isStreaming = false;
    }
}

init();