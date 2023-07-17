import mimetypes
mimetypes.add_type('text/javascript', '.js')
mimetypes.add_type('text/css', '.css')

from flask import Flask, render_template, request, jsonify
from translator import Translator
import json

app = Flask(__name__)
translator = None


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/translate', methods=['POST'])
def translate():
    request_data = request.get_data()
    request_data = request_data.decode('utf-8')
    request_data = json.loads(request_data)
    signs = request_data['mp']
    translation = translator.translate(signs)
    response = {
        'translation': translation
    }
    return jsonify(response)


if __name__ == '__main__':
    translator = Translator()

    app.run('0.0.0.0', port=80)
