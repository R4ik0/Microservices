from kafka import KafkaConsumer, KafkaProducer
import json
import time
import torch
import torch.nn as nn
import torchvision
import torchvision.transforms as transforms
import psutil
import os

consumer = None
producer = None


def load_dataset():

    for i in range(5):
        try:
            transform = transforms.Compose([transforms.ToTensor()])

            dataset = torchvision.datasets.FashionMNIST(
                root="/datasets",
                train=True,
                download=True,
                transform=transform
            )

            return dataset

        except Exception as e:
            print("Dataset download failed, retry:", e, flush=True)
            time.sleep(5)

    raise RuntimeError("Dataset download failed")

def train_model():

    start = time.time()

    transform = transforms.Compose([transforms.ToTensor()])

    dataset = torchvision.datasets.FashionMNIST(
        root="/datasets",
        train=True,
        download=True,
        transform=transform
    )

    loader = torch.utils.data.DataLoader(
        dataset,
        batch_size=256,
        shuffle=True,
        num_workers=2,
        persistent_workers=True
    )
    
    model = nn.Sequential(
        nn.Flatten(),
        nn.Linear(28*28,128),
        nn.ReLU(),
        nn.Linear(128,10)
    )

    loss_fn = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters())

    epochs = 5

    for epoch in range(epochs):

        correct = 0
        total = 0
        total_loss = 0

        for x,y in loader:

            pred = model(x)
            loss = loss_fn(pred,y)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

            predicted = pred.argmax(dim=1)
            correct += (predicted == y).sum().item()
            total += y.size(0)

        accuracy = correct / total

        process = psutil.Process(os.getpid())
        cpu = process.cpu_percent(interval=0.1)
        ram = process.memory_info().rss / (1024 ** 2)

        event = {
            "library": "pytorch",
            "epoch": epoch + 1,
            "accuracy": accuracy,
            "loss": total_loss,
            "cpu": cpu,
            "ram": ram
        }

        producer.send("training.metrics", event)

    duration = time.time() - start

    return {
        "library": "pytorch",
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
                group_id="pytorch-group",
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