
import { FilesetResolver } from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";
import { toggleVideostream } from "./hands.js"
import { createExampleData } from "./preprocessing.js";

const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");

const startButton = document.getElementById('tb');
startButton.addEventListener('click', startDetection);

function startDetection() {
    console.log("start detection")
    toggleVideostream()
    //predictWebcam()
}