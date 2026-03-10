from fastapi import FastAPI
from kafka import KafkaProducer, KafkaConsumer
from pydantic import BaseModel
import json
import threading
import time

app = FastAPI()

producer = None
consumer = None

results = []


class TrainingRequest(BaseModel):
    dataset: str = "fashion_mnist"


@app.on_event("startup")
def startup_event():
    global producer, consumer

    # connexion kafka
    for i in range(10):
        try:
            producer = KafkaProducer(
                bootstrap_servers=["kafka1:29092"],
                value_serializer=lambda v: json.dumps(v).encode("utf-8")
            )

            consumer = KafkaConsumer(
                "training.results",
                bootstrap_servers=["kafka1:29092"],
                value_deserializer=lambda m: json.loads(m.decode("utf-8")),
                group_id="api-group",
                auto_offset_reset="earliest"
            )

            print("Kafka connecté", flush=True)
            break

        except Exception as e:
            print("Kafka retry", e, flush=True)
            time.sleep(2)

    threading.Thread(target=consume_results, daemon=True).start()


def consume_results():

    for msg in consumer:
        result = msg.value
        print("Result received:", result, flush=True)
        results.append(result)


@app.post("/train")
def launch_training(req: TrainingRequest):

    payload = {
        "dataset": req.dataset,
        "timestamp": time.time()
    }

    producer.send("training.request", payload)
    producer.flush()

    return {"status": "training started"}


@app.get("/results")
def get_results():
    return results