const API_URL = "http://localhost:8000"; // ou "http://api:8000" en Docker

function startTraining() {
    return fetch(`${API_URL}/train`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ dataset: "fashion_mnist" })
    });
}

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

document.getElementById("startBtn")
    .addEventListener("click", startTraining);

function appendMetric(data) {
    const el = document.getElementById("metrics");
    el.textContent += JSON.stringify(data, null, 2) + "\n";
}

function appendResult(data) {
    const el = document.getElementById("results");
    el.textContent += JSON.stringify(data, null, 2) + "\n";
}