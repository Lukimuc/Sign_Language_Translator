import { preprocessing } from "./preprocessing.js";
import { translateToText } from "./prediction.js";

export function submitSample(poseLandmarks, handLandmarks, timestamp) {
    const samples = [];

    for (let i = 0; i < poseLandmarks.length; i++) {
        samples.push(constructArray(poseLandmarks[i], handLandmarks[i], timestamp[i]));
    }
    console.log("submit batch");
    //console.log(sampleDict)
    let preprocessedData = preprocessing(samples);
    console.log(preprocessedData);
    translateToText(preprocessedData);
}

function constructArray(poseLandmarks, handLandmarks, timestamp) {
    let [leftHandX, leftHandY, leftHandZ] = [generateNaNArray(21), generateNaNArray(21), generateNaNArray(21)];
    let [rightHandX, rightHandY, rightHandZ] = [generateNaNArray(21), generateNaNArray(21), generateNaNArray(21)];

    if (handLandmarks.handednesses.length == 1) {
        const handZero = handLandmarks.handednesses[0][0].categoryName; 
        //console.log(handZero)
        if (handZero == "Right") {
            extractHandLandmarks(rightHandX, rightHandY, rightHandZ, handLandmarks.landmarks[0]);
        } else if (handZero == "Left") {
            extractHandLandmarks(leftHandX, leftHandY, leftHandZ, handLandmarks.landmarks[0]);
        }
    } else if (handLandmarks.handednesses.length == 2) {
        const handZero = handLandmarks.handednesses[0][0].categoryName;
        if (handZero == "Right") {
            extractHandLandmarks(rightHandX, rightHandY, rightHandZ, handLandmarks.landmarks[0]);
            extractHandLandmarks(leftHandX, leftHandY, leftHandZ, handLandmarks.landmarks[1]);
        } else if (handZero == "Left") {
            extractHandLandmarks(leftHandX, leftHandY, leftHandZ, handLandmarks.landmarks[0]);
            extractHandLandmarks(rightHandX, rightHandY, rightHandZ, handLandmarks.landmarks[1]);
        } 
    }

    let [poseX, poseY, poseZ] = [generateNaNArray(6), generateNaNArray(6), generateNaNArray(6)];
    const poseArray = poseLandmarks.landmarks.landmarks[0];
    if (poseArray != undefined && poseArray.length != 0) {
        extractPoseLandmarks(poseX, poseY, poseZ, poseArray);
    }

    return [timestamp].concat(leftHandX, poseX, rightHandX, leftHandY, poseY, rightHandY, leftHandZ, poseZ, rightHandZ);
}

function extractHandLandmarks(x, y, z, landmarks) {
        for (const i of range(21)) {
            let mark = landmarks[i];
            x[i] = mark.x;
            y[i] = mark.y;
            z[i] = mark.z;
        }
}

function extractPoseLandmarks(x, y, z, landmarks) {
    for (const i of range(6)) {
        x[i] = landmarks[i + 11].x;
        y[i] = landmarks[i+ 11].y;
        z[i] = landmarks[i + 11].z;
    }
}

function generateNaNArray(length) {
   return Array.from({ length: length }, () => 'NaN');
}

function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}