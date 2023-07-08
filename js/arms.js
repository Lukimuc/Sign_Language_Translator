import { PoseLandmarker, FilesetResolver } from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";
//import { vision } from "./start.js"

let poseLandmarker = undefined;
let runningMode = "VIDEO";

const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
const createPoseLandmarker = async () => {
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "../models/pose_landmarker_full.task",
            delegate: "GPU"
        },
        runningMode: runningMode,
        numPoses: 2
    });
};

createPoseLandmarker();

let lastVideoTime = -1;
export async function poseLandmarksForVideo(video) {
    return new Promise((resolve, reject) => {
        let startTimeMs = performance.now();
        if (lastVideoTime >= video.currentTime) {
            reject()
        }
        lastVideoTime = video.currentTime;
        try {
            poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
                resolve(result)
            });
        } catch(error) {
            reject(error)
        }
    })
}