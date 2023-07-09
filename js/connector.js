var sampleDict = {}


export function submitSample(poseLandmarks, handLandmarks, timestamp) {
    sampleDict[timestamp] = [poseLandmarks, handLandmarks]
    console.log(sampleDict[timestamp])
}