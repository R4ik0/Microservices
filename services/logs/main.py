from kafka import KafkaConsumer
import psycopg2
import json
import time

consumer = None
conn = None


def start():

    global consumer, conn

    # connexion kafka
    for i in range(10):
        try:
            consumer = KafkaConsumer(
                "training.request",
                "training.results",
                "training.metrics",
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

    # connexion postgres
    for i in range(10):
        try:
            conn = psycopg2.connect(
                "dbname=logs user=user password=password host=logs_db"
            )

            cur = conn.cursor()

            cur.execute("""
            CREATE TABLE IF NOT EXISTS logs (
                id SERIAL PRIMARY KEY,
                topic TEXT,
                partition INT,
                kafka_offset BIGINT,
                key TEXT,
                payload JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            conn.commit()
            print("DB connectée", flush=True)
            break

        except Exception as e:
            print("DB retry", e, flush=True)
            time.sleep(2)

    consume()


def consume():

    for msg in consumer:

        payload = msg.value

        print("LOG:", msg.topic, payload, flush=True)

        cur = conn.cursor()

        cur.execute(
            """
            INSERT INTO logs (topic, partition, kafka_offset, key, payload)
            VALUES (%s,%s,%s,%s,%s)
            """,
            (
                msg.topic,
                msg.partition,
                msg.offset,
                msg.key.decode() if msg.key else None,
                json.dumps(payload)
            )
        )

        conn.commit()


if __name__ == "__main__":
    start()