function createExampleData() {
    let numSamples = Math.floor(Math.random() * 600);

    let data = [];
    for (let i = 0; i < 5; i++) {
        let currValues = [];
        for (let j = 0; j < 144; j++) {
            currValues.push("NaN");
        }
        data.push(currValues);
    }
    for (let i = 0; i < 5; i++) {
        let currValues = [];
        for (let j = 0; j < 144; j++) {
            currValues.push(Math.random());
        }
        data.push(currValues);
    }
    for (let i = 0; i < 10; i++) {
        let currValues = [];
        for (let j = 0; j < 144; j++) {
            currValues.push("NaN");
        }
        data.push(currValues);
    }
    for (let i = 0; i < 5; i++) {
        let currValues = [];
        for (let j = 0; j < 144; j++) {
            currValues.push(Math.random());
        }
        data.push(currValues);
    }
    for (let i = 0; i < 20; i++) {
        let currValues = [];
        for (let j = 0; j < 144; j++) {
            currValues.push("NaN");
        }
        data.push(currValues);
    }
    for (let i = 0; i < numSamples; i++) {
        let currValues = [];
        for (let j = 0; j < 144; j++) {
            currValues.push(Math.random());
        }
        data.push(currValues);
    }
    for (let i = 0; i < 20; i++) {
        let currValues = [];
        for (let j = 0; j < 144; j++) {
            currValues.push("NaN");
        }
        data.push(currValues);
    }
    return data;
}

function interpolate(data, counter, index) {


}

function preprocessing(data) {
    const leftHandIdx = 0, poseIdx = 21, rightHandIdx = 27;
    let counterLeft = 0, counterPose=0, counterRight=0;
    let firstLeftWasNan = false, firstRightWasNan = false, firstPoseWasNan = false;

    for (let i = 0; i < data.length; i++) {
        row = data[i];
        if (row[leftHandIdx] === 'NaN'){
            counterLeft++;
            if (i === 0) firstLeftWasNan = true;
        }
        if (row[rightHandIdx] === 'NaN'){
            counterRight++;
            if (i === 0) firstRightWasNan = true;
        }
        if (row[poseIdx] === 'NaN'){
            counterPose++;
            if (i === 0) firstPoseWasNan = true;
        }

        if (row[leftHandIdx] !== 'NaN' && counterLeft > 0 && counterLeft < 15) {
            if(firstLeftWasNan) {
                for (let j = 0; j < counterLeft; j++){
                    for (let k = 0; k < 21; k++){
                        data[j][k] = row[k];
                    }
                    for (let h = 48; h < 69; h++){
                        data[j][h] = row[h];
                    }
                    for (let z = 96; z < 117; z++){
                        data[j][z] = row[z];
                    }
                }
            } else {
                // interpolate
                
                for (let k = 0; k < 21; k++){
                    let bottom = data[i-counterLeft-1][k];
                    let top = data[i][k];
                    let counter = 1;
                    for (let j = i-counterLeft; j < i; j++){
                        data[j][k] = bottom + ((counter/(counterLeft+1))*(top-bottom));
                        counter++;
                    }
                }
                for (let h = 48; h < 69; h++){
                    let bottom = data[i-counterLeft-1][h];
                    let top = data[i][h];
                    let counter = 1;
                    for (let j = i-counterLeft; j < i; j++){
                        data[j][h] = bottom + ((counter/(counterLeft+1))*(top-bottom));
                        counter++;
                    }
                }
                for (let z = 96; z < 117; z++){
                    let bottom = data[i-counterLeft-1][z];
                    let top = data[i][z];
                    let counter = 1;
                    for (let j = i-counterLeft; j < i; j++){
                        data[j][z] = bottom + ((counter/(counterLeft+1))*(top-bottom));
                        counter++;
                    }
                }
                
            }
            firstLeftWasNan = false;
        }
        if (row[rightHandIdx] !== 'NaN' && counterRight > 0 && counterRight < 15) {
            if(firstRightWasNan) {
                for (let j = 0; j < counterRight; j++){
                    for (let k = 27; k < 48; k++){
                        data[j][k] = row[k];
                    }
                    for (let h = 75; h < 96; h++){
                        data[j][h] = row[h];
                    }
                    for (let z = 123; z < 144; z++){
                        data[j][z] = row[z];
                    }
                }

            } else {
                // interpolate
                for (let k = 27; k < 48; k++){
                    let bottom = data[i-counterRight-1][k];
                    let top = data[i][k];
                    let counter = 1;
                    for (let j = i-counterRight; j < i; j++){
                        data[j][k] = bottom + ((counter/(counterRight+1))*(top-bottom));
                        counter++;
                    }
                }
                for (let h = 75; h < 96; h++){
                    let bottom = data[i-counterRight-1][h];
                    let top = data[i][h];
                    let counter = 1;
                    for (let j = i-counterRight; j < i; j++){
                        data[j][h] = bottom + ((counter/(counterRight+1))*(top-bottom));
                        counter++;
                    }
                }
                for (let z = 123; z < 144; z++){
                    let bottom = data[i-counterRight-1][z];
                    let top = data[i][z];
                    let counter = 1;
                    for (let j = i-counterRight; j < i; j++){
                        data[j][z] = bottom + ((counter/(counterRight+1))*(top-bottom));
                        counter++;
                    }
                }
            }
            firstRightWasNan = false;
        }
        if (row[poseIdx] !== 'NaN' && counterPose > 0 && counterPose < 15) {
            if(firstPoseWasNan) {
                for (let j = 0; j < counterPose; j++){
                    for (let k = 21; k < 27; k++){
                        data[j][k] = row[k];
                    }
                    for (let h = 69; h < 75; h++){
                        data[j][h] = row[h];
                    }
                    for (let z = 117; z < 123; z++){
                        data[j][z] = row[z];
                    }
                }
            } else {
                // interpolate
                for (let k = 21; k < 27; k++){
                    let bottom = data[i-counterPose-1][k];
                    let top = data[i][k];
                    let counter = 1;
                    for (let j = i-counterPose; j < i; j++){
                        data[j][k] = bottom + ((counter/(counterPose+1))*(top-bottom));
                        counter++;
                    }
                }
                for (let h = 69; h < 75; h++){
                    let bottom = data[i-counterPose-1][h];
                    let top = data[i][h];
                    let counter = 1;
                    for (let j = i-counterPose; j < i; j++){
                        data[j][h] = bottom + ((counter/(counterPose+1))*(top-bottom));
                        counter++;
                    }
                }
                for (let z = 117; z < 123; z++){
                    let bottom = data[i-counterPose-1][z];
                    let top = data[i][z];
                    let counter = 1;
                    for (let j = i-counterPose; j < i; j++){
                        data[j][z] = bottom + ((counter/(counterPose+1))*(top-bottom));
                        counter++;
                    }
                }
            }
            firstPoseWasNan = false;
        }

        if (row[leftHandIdx] !== 'NaN') counterLeft = 0;
        if (row[rightHandIdx] !== 'NaN') counterRight = 0;
        if (row[poseIdx] !== 'NaN') counterPose = 0;
    }

    // replace remaining NaN with -1
    let preprocessedData = [];
    for (let i = 0; i < data.length; i++) {
        let row = data[i];
        prepRow = row.map((element) => {
            if (element === 'NaN') return -1;
            else return element
        });
        preprocessedData.push(prepRow);
    }

    // pad length to 900
    while (preprocessedData.length < 900) {
        let padRow = [];
        for (let j = 0; j < 144; j++) {
            padRow.push(0);
        }
        preprocessedData.push(padRow);
    }

    return preprocessedData;
}

function init() {
    data = createExampleData();  // TODO: Data should be the recorded data from the other files.
    data = preprocessing(data);
    console.log(data);
}

init();
