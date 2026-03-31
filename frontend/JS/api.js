const API_URL = "http://localhost:8000"; // ou "http://api:8000" en Docker

function startTraining() {
    return fetch(`${API_URL}/train`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ dataset: "fashion_mnist" })
    });
}