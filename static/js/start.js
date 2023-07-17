import { DrawingUtils, HandLandmarker, PoseLandmarker, FilesetResolver } from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";
import { poseLandmarksForVideo, createPoseLandmarker } from "./armLandmarker.js";
import { handLandmarksForVideo, createHandLandmarker} from "./handLandmarker.js";
import { submitSample } from "./connector.js";

const startButton = document.getElementById('tb');
const textOverlay = document.getElementById('textOverlay');
const videoElement = document.getElementById('videoElement');
const outputElement = document.getElementById('outputElement');
const video3 = document.getElementsByClassName('input_video3')[0];
const out3 = document.getElementsByClassName('output3')[0];
const canvasCtx3 = out3.getContext('2d');
const drawingUtils = new DrawingUtils(canvasCtx3);

let isStreaming = false;
let camera = undefined;
let timer = undefined;
let isFirstSpacebarClick = true;
let isKeyDown = false;
let isDetecting = false;
let drawingEnabled = false;
const dataQueue = [];

function sendSamples() {
    if (isDetecting && dataQueue.length > 1) {
        console.log('Sending Samples');
        const allPose = dataQueue.map(({ poseLandmarks }) => poseLandmarks);
        const allHand = dataQueue.map(({handLandmarks}) => handLandmarks);
        const allTime = dataQueue.map(({timestamp}) => timestamp);

        submitSample(allPose, allHand, allTime);
    }
}

function activateStartButton() {
    startButton.addEventListener('click', toggleVideostream);
    startButton.disabled = false;
}

function toggleVideostream() {
    if (isStreaming) {
        stopStream();
        clearInterval(timer);
    } else {
        startStream();
        timer = setInterval(sendSamples, 1000);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    console.log('DOM loaded in start');
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    Promise.all([
        createHandLandmarker(vision),
        createPoseLandmarker(vision)
    ]).then(() => { 
        console.log("landmarkers loaded, activate StartButton");
        activateStartButton();
    })
   
});

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
      if (!isKeyDown) {
        isKeyDown = true;
        console.log("Spacebar pressed");
        if (!isDetecting) {
          isDetecting = true;
          setupDetection();
        }

        if (isFirstSpacebarClick) {
            textOverlay.textContent = 'Landmarks loading... Please remain pressing the spacebar.';
            textOverlay.style.color = 'grey';
            isFirstSpacebarClick = false;
          }
      } else {
        drawingEnabled = true;
      }
      event.preventDefault();
    }
  });

  document.addEventListener('keyup', function(event) {
    if (event.code === 'Space') {
      isKeyDown = false;
      drawingEnabled = false;

      isDetecting = false;
      canvasCtx3.clearRect(0, 0, out3.width, out3.height); // Clear
    }
  });

async function startStream() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            video3.srcObject = stream;

            await new Promise((resolve) => {
                video3.onloadedmetadata = resolve;
            });

            video3.style.width = '100%';
            video3.style.height = '100%';
            out3.style.width = '100%';
            out3.style.height = '100%';

            outputElement.style.display = 'block';
            videoElement.style.display = 'block';
            video3.style.display = 'block';
            textOverlay.style.background ='rgba(0,0,0,0.0)';

            isStreaming=true;
            tb.textContent = 'Stop Videostream';

        } catch (error) {
            console.log('Error accessing media devices:', error);
        }
    } else {
        console.log('getUserMedia is not supported');
    }
}

function setupDetection() {
    document.getElementById("translation-text").innerHTML = "";
    console.log("setupDetection fired");
    camera = new Camera(video3, {
        onFrame: async () => {
            if (!isDetecting) {
                return; // Exit the callback if detection is not enabled
            }
            const results = await Promise.all([
                poseLandmarksForVideo(video3),
                handLandmarksForVideo(video3)
            ])
            const poseLandmarks = await results[0]
            const handLandmarks = await results[1]
            if (isDetecting) {
                drawResults(handLandmarks, poseLandmarks);
                /*  submitSample(poseLandmarks, handLandmarks, poseLandmarks.timestamp);*/

                //Add data zu dataqueue
                dataQueue.push({ poseLandmarks, handLandmarks, timestamp: poseLandmarks.timestamp }); //,

                // Queue > 900 elements, remove the oldest element
                if (dataQueue.length > 900) {
                    dataQueue.shift();
                }
                // console.log("DataQueue: "+ JSON.stringify(dataQueue));
            }
        },
        width: video3.style.width,
        height: video3.style.height,
    });
    camera.start();
}


function drawResults(handLandmarks, poseLandmarks) {
    if (!drawingEnabled && !isDetecting) {
      canvasCtx3.clearRect(0, 0, out3.width, out3.height);
      return; // Exit the function without drawing if drawing is disabled
    }

    canvasCtx3.save();
    canvasCtx3.clearRect(0, 0, out3.width, out3.height);

    for (const landmark of handLandmarks.landmarks) {
        drawingUtils.drawLandmarks(landmark, {
            radius: (data) => DrawingUtils.lerp(data.z, -0.15, 0.1, 5, 1)
        });
        drawingUtils.drawConnectors(landmark, HandLandmarker.HAND_CONNECTIONS);
    }

    for (const landmark of poseLandmarks.landmarks.landmarks) {
        drawingUtils.drawLandmarks(landmark, {
            radius: (data) => {
                return DrawingUtils.lerp(data.z, -0.15, 0.1, 5, 1);
            }
        });

        const cons = PoseLandmarker.POSE_CONNECTIONS;
        const connectionArray = [cons[10], cons[11], cons[16], cons[17]];
        drawingUtils.drawConnectors(landmark, connectionArray);
    }

    canvasCtx3.restore();
}

function stopStream() {
    console.log("StopStream called");
    const stream = video3.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    video3.srcObject = null;
    camera = undefined;
    tb.textContent = 'Start Videostream';
    isStreaming = false;

    textOverlay.style.background ='#0053c4';
    textOverlay.textContent='Click button below to start camera';
    textOverlay.style.color ='white';
   /* textOverlay.textContent.style.top ='50%';
    textOverlay.textContent.style.left ='50%';*/

    textOverlay.style.display = 'flex';
    textOverlay.style.alignItems = 'center';
    textOverlay.style.justifyContent = 'center';
    textOverlay.style.height = '100%';
    textOverlay.style.width = '100%';

    outputElement.style.display = 'none';
    video3.style.display = 'none';
    videoElement.style.display = 'none';
}