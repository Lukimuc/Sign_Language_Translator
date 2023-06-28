const WIDTH = 1280;
const HEIGHT = 720;
const video3 = document.getElementsByClassName('input_video3')[0];
const out3 = document.getElementsByClassName('output3')[0];
const controlsElement3 = document.getElementsByClassName('control3')[0];
const canvasCtx3 = out3.getContext('2d');
const fpsControl = new FPS();
let isStreaming = false;

const textOverlay = document.getElementById('textOverlay');
const videoElement = document.getElementById('videoElement');
const outputElement = document.getElementById('outputElement');

// Set dimensions of video and canvas elements
video3.width = WIDTH;
video3.height = HEIGHT;
out3.width = WIDTH;
out3.height = HEIGHT;

// Set CSS width and height properties to ensure correct rendering
video3.style.width = '100%';
video3.style.height = '100%';
out3.style.width = '100%';
out3.style.height = '100%';

function onResultsHands(results) {

    /*document.body.classList.add('loaded');*/
    fpsControl.tick();
    canvasCtx3.save();
    canvasCtx3.clearRect(0, 0, out3.width, out3.height);
    canvasCtx3.drawImage(results.image, 0, 0, out3.width, out3.height);
    if (results.multiHandLandmarks && results.multiHandedness) {
      for (let index = 0; index < results.multiHandLandmarks.length; index++) {
        const classification = results.multiHandedness[index];
        const isRightHand = classification.label === 'Right';
        const landmarks = results.multiHandLandmarks[index];
        // Extract x, y, z positions
        const positions = landmarks.map((landmark) => ({
          x: landmark.x,
          y: landmark.y,
          z: landmark.z,
        }));
        // Use the extracted positions as needed
        console.log(positions);
        drawConnectors(
          canvasCtx3,
          landmarks,
          HAND_CONNECTIONS,
          { color: isRightHand ? '#00FF00' : '#FF0000' }
        );
        drawLandmarks(canvasCtx3, landmarks, {
          color: isRightHand ? '#00FF00' : '#FF0000',
          fillColor: isRightHand ? '#FF0000' : '#00FF00',
          radius: (x) => {
            return lerp(x.from.z, -0.15, 0.1, 10, 1);
          },
        });
      }
    }
    canvasCtx3.restore();
  }

const tb = document.getElementById('tb');
tb.addEventListener('click', toggleVideostream);
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}`;
  },
});

async function toggleVideostream() {
  if (isStreaming) {
    // Stop the video stream
    const stream = video3.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    video3.srcObject = null;
    tb.textContent = 'Start Videostream';
    isStreaming = false;
    outputElement.style.display = 'none';
    textOverlay.style.display = 'block';
    videoElement.style.display = 'none';
  } else {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video3.srcObject = stream;

        // Wait for the video to load the new stream
        await new Promise((resolve) => {
          video3.onloadedmetadata = resolve;
        });

        // Update the video element's dimensions to match the loaded stream
     
      video3.style.width = '100%';
      video3.style.height = '100%';
      out3.style.width = '100%';
      out3.style.height = '100%';

        hands.onResults(onResultsHands);
        const camera = new Camera(video3, {
          onFrame: async () => {
            await hands.send({ image: video3 });
          },
          width: WIDTH,
          height: HEIGHT,
        });
        tb.textContent = 'Stop Videostream';
        isStreaming = true;
        outputElement.style.display = 'block';
        textOverlay.style.display = 'none';
        camera.start();

        videoElement.style.display = 'block';

        
        const controlPanel = new ControlPanel(controlsElement3, {
          selfieMode: false,
          maxNumHands: 2,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        controlPanel
          .add([
            new StaticText({ title: 'MediaPipe Hands' }),
            fpsControl,
            new Toggle({ title: 'Selfie Mode', field: 'selfieMode' }),
            new Slider({ title: 'Max Number of Hands', field: 'maxNumHands', range: [1, 4], step: 1 }),
            new Slider({
              title: 'Min Detection Confidence',
              field: 'minDetectionConfidence',
              range: [0, 1],
              step: 0.01,
            }),
            new Slider({
              title: 'Min Tracking Confidence',
              field: 'minTrackingConfidence',
              range: [0, 1],
              step: 0.01,
            }),
          ])
          .on(options => {
            hands.setOptions(options);
          });


      } catch (error) {
        console.log('Error accessing media devices:', error);
      }
    } else {
      console.log('getUserMedia is not supported');
    }
  }
}
