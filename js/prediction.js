const translationText = document.getElementById('outputElement');

const model = await tf.loadGraphModel('./models/ASLPredictor/model.json');

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

function predictTransformer(signs, context) {
    let tens = tf.tidy(()  => {
        let asTensor = tf.tensor(signs);
        return asTensor.reshape([-1, asTensor.shape[0], asTensor.shape[1]]);
    });

    let ctens = tf.tidy(() => {
        let asTensor = tf.tensor(context).cast('int32');
        return asTensor.reshape([-1, asTensor.shape[0]]);
    });

    tens.print();
    ctens.print();

    tens = tf.ones([1, 900, 144]);
    ctens = tf.ones([1, 100]).cast('int32');
    
    return Array.from(
        model.predict([tens, ctens], {
            batchSize: 1,
        }).dataSync()); // Maybe this works ...
}


export function translateToText(mediapipeData){
    let text = [60];
    let textPhrase ="";
    let nextI = 1;
    let maxIdx = -1; 
    while (text.length < 100){
        text.push(59);
    }
    while(maxIdx !== 59) { 
        console.log(mediapipeData);
        console.log(text);
        // let results = model.predict([mediapipeData, text]);
        let results = predictTransformer(mediapipeData, text);
        console.log('##############################################################');
        console.log(results);
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
    }
}



































