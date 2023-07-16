const translationText = document.getElementById('translation-text');

export function translateToText(mediapipeData){
    fetch('/translate', {
        method: 'POST',
        body: JSON.stringify({
            'mp': mediapipeData
        })
    }).then((res) => {
        console.log(res.status);
        return res.json();
    }).then((data) => {
        translationText.innerText = data['translation'];
        console.log('Updated translation');
    });
}
