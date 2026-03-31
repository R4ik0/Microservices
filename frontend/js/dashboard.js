// Afficher le username depuis le token
const usernameDisplay = document.getElementById('usernameDisplay');
const logoutBtn = document.getElementById('logoutBtn');

const token = localStorage.getItem('access_token');

// if (!token) {
//     window.location.href = "index.html";
//     console.log("No token found, redirecting to login.");
// } else {
//     // Décodage simple du JWT pour récupérer le username peut-être à exploiter pour voir si admin
//     const payload = JSON.parse(atob(token.split('.')[1]));
//     usernameDisplay.textContent = payload.sub;
//     if (payload.role !== "admin") {
//         document.getElementById("adminPanel").style.display = "none";
//     }
// }

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('access_token');
    window.location.href = "index.html";
});

const Charts = [];
const Names = ['Accuracy', 'Loss', 'RAM', 'CPU']
Names.forEach(metric => {
    const chart = new Chart(document.getElementById(`chart${metric}`), {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Keras',
                    data: [],
                    borderColor: 'green',
                    fill: false
                },
                {
                    label: 'PyTorch',
                    data: [],
                    borderColor: 'blue',
                    fill: false
                }
            ]
        },
        options: {
            animation: false,
            parsing: false,
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Temps (s)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: metric
                    }
                }
            }
        }
    });
    Charts.push(chart);
});


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
    if (!data.training_time) {
        if (data.library === "keras") {
            Charts.forEach((chart,index) => {
                chart.data.datasets[0].data.push({
                    x: data.elapsed_time,
                    y: data[Names[index].toLowerCase()]
                });
            });
        } else if (data.library === "pytorch") {
            Charts.forEach((chart,index) => {
                if (Names[index] === "Loss") {
                    chart.data.datasets[1].data.push({
                        x: data.elapsed_time,
                        y: data[Names[index].toLowerCase()] / 250
                    });
                } else {
                    chart.data.datasets[1].data.push({
                        x: data.elapsed_time,
                        y: data[Names[index].toLowerCase()]
                    });
                }
            });
        }

        Charts.forEach(chart => chart.update('none'));
    } else {
        console.log(`Training finished in ${data.training_time}s`);
    }
};

document.getElementById("startBtn")
    .addEventListener("click", startTraining);
