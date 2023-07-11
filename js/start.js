import { DrawingUtils, HandLandmarker, PoseLandmarker } from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";
import { poseLandmarksForVideo } from "./arms.js"
import { handLandmarksForVideo } from "./handLandmarker.js"
import { submitSample } from "./connector.js";

const startButton = document.getElementById('tb');
const textOverlay = document.getElementById('textOverlay');
const videoElement = document.getElementById('videoElement');
const outputElement = document.getElementById('outputElement');
const video3 = document.getElementsByClassName('input_video3')[0];
const out3 = document.getElementsByClassName('output3')[0];
const canvasCtx3 = out3.getContext('2d');
const drawingUtils = new DrawingUtils(canvasCtx3);

let isStreaming = false
let camera = undefined

startButton.addEventListener('click', toggleVideostream);

function toggleVideostream() {
    if (isStreaming) {
        stopStream()
    } else {
        startStream()
    }
}

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

            setupDetection();
            isStreaming = true;

            tb.textContent = 'Stop Videostream';

            outputElement.style.display = 'block';
            videoElement.style.display = 'block';
            video3.style.display = 'block';
            textOverlay.style.display = 'none';

            camera.start();
        } catch (error) {
            console.log('Error accessing media devices:', error);
        }
    } else {
        console.log('getUserMedia is not supported');
    }
}

function setupDetection() {
    camera = new Camera(video3, {
        onFrame: async () => {
            const results = await Promise.all([
                poseLandmarksForVideo(video3),
                handLandmarksForVideo(video3)
            ])
            const poseLandmarks = await results[0]
            const handLandmarks = await results[1]
            drawResults(handLandmarks, poseLandmarks)
            submitSample(poseLandmarks, handLandmarks, poseLandmarks.timestamp)
        },
        width: video3.style.width,
        height: video3.style.height,
    });
}


function drawResults(handLandmarks, poseLandmarks) {
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
                if (data.index >= 11 && data.index <= 16) {
                    return DrawingUtils.lerp(data.z, -0.15, 0.1, 5, 1)
                } else {
                    return (0, 0, 0, 0)
                }
            },
        });

        const cons = PoseLandmarker.POSE_CONNECTIONS
        console.log(cons)
        const connectionArray = [cons[10], cons[11], cons[16], cons[17]]
        drawingUtils.drawConnectors(landmark, connectionArray);
    }

    canvasCtx3.restore();
}

function stopStream() {
    const stream = video3.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    video3.srcObject = null;
    camera = undefined
    tb.textContent = 'Start Videostream';
    isStreaming = false;
    textOverlay.style.display = 'block';
    outputElement.style.display = 'none';
    video3.style.display = 'none';
    videoElement.style.display = 'none';
}