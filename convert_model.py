import tensorflow as tf
import tensorflowjs as tfjs

# Load the Keras model
model = tf.keras.models.load_model('asl_model.keras')

# Convert and save as TensorFlow.js model
tfjs.converters.save_keras_model(model, './public/tfjs_model')
print("Model converted successfully!")