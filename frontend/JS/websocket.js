const WS_URL = "ws://localhost:8000/ws"; // ou ws://api:8000/ws

let socket = new WebSocket(WS_URL);

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.training_time) {
        appendResult(data);
    } else {
        appendMetric(data);
    }
};