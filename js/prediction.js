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


export function translateToText(mediapipeData){
    let text = [60];
    let textPhrase ="";
    let nextI = 1;
    while (text.length < 100){
        text.push(59);
    }
    while(maxIdx !== 59) { 
        let results = model.predict([mediapipeData, text]);
        console.log(results);
        let maxIdx = -1; 
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



































