import { HandLandmarker, FilesetResolver } from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

let handLandmarker = undefined
let runningMode = "VIDEO";

const createHandLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "../models/hand_landmarker.task",
            delegate: "GPU"
        },
        runningMode: runningMode,
        numHands: 2
    });
};

createHandLandmarker();

let lastVideoTime = -1;
let results = undefined;

export async function handLandmarksForVideo(video) {
    return new Promise(async (resolve, reject) => {
        if (runningMode === "IMAGE") {
            runningMode = "VIDEO";
            await handLandmarker.setOptions({ runningMode: "VIDEO" });
        }
        let startTimeMs = performance.now();
        if (lastVideoTime !== video.currentTime) {
            lastVideoTime = video.currentTime;
            results = handLandmarker.detectForVideo(video, startTimeMs);
            resolve(results)
        } else {
            reject()
        }
    })
}