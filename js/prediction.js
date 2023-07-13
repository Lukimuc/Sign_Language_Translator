const translationText = document.getElementById('outputElement');
let model = undefined;
let loadingModel = false;

async function loadModel() {
    return await tf.loadGraphModel('./models/ASLPredictor/model.json');
}

const indexToChars = {};
fetch('./json/character_to_prediction_index.json')
  .then(response => response.json())
  .then(data => {
    getindexToCharJson(data);
  })
  .catch(error => {
    console.error('Error loading JSON file:', error);
  });


function getindexToCharJson(charsToIndex){
    for (const key in charsToIndex) {
        const value = charsToIndex[key];
        indexToChars[value] = key;
    }
}

async function predictTransformer(signs, context) {
    // const model = await tf.loadGraphModel('./models/ASLPredictor/model.json');
    let tens = tf.tidy(()  => {
        let asTensor = tf.tensor(signs);
        return asTensor.reshape([-1, asTensor.shape[0], asTensor.shape[1]]);
    });

    let ctens = tf.tidy(() => {
        let asTensor = tf.tensor(context);
        return asTensor.reshape([-1, asTensor.shape[0]]);
    });

    console.log(tens);
    console.log(ctens);
    model.inputNodes.forEach(node => console.log(node));

    
    return model.predict({
                'input_1': tens,
                'input_2': ctens
            }, {
                batchSize: 1,
            }).dataSync(); // Maybe this works ...
}


export function translateToText(mediapipeData){
    if(model === undefined) {
        if (!loadingModel) {
            loadingModel = true;
            loadModel().then((loaded) => {
                model = loaded;
                loadingModel = false;
                console.log(model);
            });
        }
        console.log('Model not initialized');
        return;
    }

    let text = [60];
    let textPhrase ="";
    let nextI = 1;
    let maxIdx = -1; 
    while (text.length < 100){
        text.push(59);
    }
    while(maxIdx !== 59) { 
        // console.log(mediapipeData);
        // console.log(text);
        // let results = model.predict([mediapipeData, text]);
        predictTransformer(mediapipeData, text).then((results) => {
            console.log('##############################################################');
            console.log(results);
        });
        break;
        /*
        maxIdx = -1;
        let maxValue = -1;
        for (let i = 0; i < results.length; i++){
            if (results[i] > maxValue){
                maxValue = results[i];
                maxIdx = i;
            }
        }

        if(maxIdx !== 59){
            text[nextI] = maxIdx;
            nextI++;
            let character = indexToChars[maxIdx];
            textPhrase = textPhrase + character;
            let outputPhrase = "Translation: " + textPhrase;
            translationText.innerText = outputPhrase;
        }
        */
    }
}



































