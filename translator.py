import json
from transformer_update import get_compiled_transformer
import numpy as np
import tensorflow as tf
from copy import deepcopy


class Translator:
    def __init__(self):
        with open("./data/character_to_prediction_index.json", "r") as f:
            self.characters = json.load(f)

        # Tuned Hyperparameters
        d_model = 141  # hidden layer(s) dimensionality
        num_layers = 1  # how many encoders and decoders to stack
        num_heads = 3  # how many attention heads should every mha have
        ff_dim = 389  # how many neurons shall feed-forward layers have
        dropout_rate = 0.2867

        output_vocab_size = len(self.characters) + 2  # TODO: Change with new model
        print(output_vocab_size)
        self.transformer = get_compiled_transformer(
            sign_shape=(900, 144),
            context_shape=(100,),
            d_model=d_model,
            num_layers=num_layers,
            num_heads=num_heads,
            ff_dim=ff_dim,
            dropout_rate=dropout_rate,
            output_vocab_size=output_vocab_size
        )
        self.transformer.load_weights('./savedModelWeights/savedModelWeights')

    def translate(self, data):
        print('Got signs')
        signs = np.array(data)

        signs = tf.convert_to_tensor(signs, dtype=tf.float32, name='input_1')
        signs = signs[tf.newaxis]

        start = np.array([60])
        end = np.array([61])
        pad = np.array([59])

        output = tf.TensorArray(dtype=tf.int64, size=0, dynamic_size=True)
        output = output.write(0, start)

        for i in tf.range(100):
            context = deepcopy(output)
            while context.size() < 100:
                context = context.write(context.size(), end)
            context = tf.transpose(context.stack())
            print('Doing prediction')
            predictions = self.transformer([signs, context], training=False)

            predictions = predictions[:, -1:, :]
            predicted = tf.argmax(predictions, axis=-1)
            output = output.write(i + 1, predicted[0])

            if predicted == end or predicted == pad:
                break

        output_tensor = output.stack()
        output_array = output_tensor.numpy()

        output_list = output_array.reshape((-1, )).tolist()

        translation = ''
        for o in output_list:
            if o == 60:
                continue
            if o == 59 or o == 61:
                break
            translation += list(self.characters.keys())[list(self.characters.values()).index(o)]

        return translation
