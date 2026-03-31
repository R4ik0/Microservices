from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from kafka import KafkaProducer, KafkaConsumer
from pydantic import BaseModel
import json
import threading
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # pour dev (autorise tout)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

producer = None
consumer = None

results = []


class TrainingRequest(BaseModel):
    dataset: str = "fashion_mnist"


clients = []

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    clients.append(ws)

    try:
        while True:
            await ws.receive_text()
    except:
        clients.remove(ws)


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
                "training.metrics",
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


import asyncio

def consume_results():
    for msg in consumer:
        result = msg.value
        results.append(result)

        # broadcast websocket
        for ws in clients:
            asyncio.run(ws.send_json(result))


# def consume_results():

#     for msg in consumer:
#         result = msg.value
#         print("Result received:", result, flush=True)
#         results.append(result)


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