from kafka import KafkaConsumer, KafkaProducer
import json
import time
import tensorflow as tf
import psutil
import os

consumer = None
producer = None

process = psutil.Process(os.getpid())

class MetricsCallback(tf.keras.callbacks.Callback):

    def __init__(self, start_time):
        super().__init__()
        self.start_time = start_time

    def on_epoch_end(self, epoch, logs=None):

        cpu = process.cpu_percent(interval=None)
        ram = process.memory_info().rss / (1024 ** 2)
        elapsed = time.time() - self.start_time

        event = {
            "library": "keras",
            "epoch": epoch + 1,
            "accuracy": float(logs["accuracy"]),
            "loss": float(logs["loss"]),
            "cpu": cpu,
            "ram": ram,
            "elapsed_time": elapsed
        }

        producer.send("training.metrics", event)
        producer.flush()


def train_model():

    start = time.time()

    (x_train, y_train), _ = tf.keras.datasets.fashion_mnist.load_data()

    x_train = x_train / 255.0

    model = tf.keras.Sequential([
        tf.keras.layers.Flatten(input_shape=(28,28)),
        tf.keras.layers.Dense(128, activation="relu"),
        tf.keras.layers.Dense(10, activation="softmax")
    ])

    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    model.fit(
        x_train,
        y_train,
        epochs=5,
        batch_size=64,
        callbacks=[MetricsCallback(start)]
    )

    duration = time.time() - start

    return {
        "library": "keras",
        "training_time": duration
    }


def consume_training():

    for msg in consumer:

        event = msg.value
        print("Training request:", event, flush=True)

        result = train_model()

        producer.send("training.results", result)
        producer.flush()

        print("Result sent:", result, flush=True)


def start():

    global consumer, producer

    for i in range(10):
        try:

            consumer = KafkaConsumer(
                "training.request",
                bootstrap_servers=["kafka1:29092"],
                value_deserializer=lambda m: json.loads(m.decode("utf-8")),
                group_id="keras-group",
                auto_offset_reset="earliest",
                enable_auto_commit=True
            )

            producer = KafkaProducer(
                bootstrap_servers=["kafka1:29092"],
                value_serializer=lambda v: json.dumps(v).encode("utf-8")
            )

            print("Kafka connected", flush=True)
            break

        except Exception as e:
            print("Kafka retry", e, flush=True)
            time.sleep(2)

    consume_training()


if __name__ == "__main__":
    start()