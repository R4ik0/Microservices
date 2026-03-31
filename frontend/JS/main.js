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