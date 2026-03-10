from kafka import KafkaConsumer
import json

consumer = KafkaConsumer(
    "order.created",
    bootstrap_servers="kafkat:9092",  # si tu testes depuis ta machine
    auto_offset_reset="earliest",
    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
    group_id="test-group"
)

print("Listening to order.created…")
for msg in consumer:
    print(msg.value)
