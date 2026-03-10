from kafka import KafkaConsumer
import json
import time


def start():

    for i in range(10):
        try:
            consumer = KafkaConsumer(
                "training.results",
                "training.metrics",
                "training.request",
                bootstrap_servers=["kafka1:29092"],
                value_deserializer=lambda m: json.loads(m.decode("utf-8")),
                group_id="logs-group",
                auto_offset_reset="earliest"
            )

            print("Kafka connecté", flush=True)
            break

        except Exception as e:
            print("Kafka retry", e, flush=True)
            time.sleep(2)

    for msg in consumer:

        event = msg.value

        print("LOG EVENT:", event, flush=True)


if __name__ == "__main__":
    start()