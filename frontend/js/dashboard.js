// Afficher le username depuis le token
const usernameDisplay = document.getElementById('usernameDisplay');
const logoutBtn = document.getElementById('logoutBtn');

// (async () => {
//     const token = window.sessionStorage['access_token'];
//     console.log(window.sessionStorage);
//     console.log("Token:", token);
//     if (!token) {
//         window.location.href = "index.html";
//         return;
//     }

//     try {
//         const response = await fetch('http://localhost:8001/user', {
//             method: 'GET',
//             headers: { 
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             }
//         });
//         const user = await response.json();
//         if (user.role !== "admin") {
//             document.getElementById("adminPanel").style.display = "none";
//         }
//     } catch (err) {
//         console.error(err);
//         // window.sessionStorage.removeItem('access_token');
//         // window.location.href = "index.html";
//     }
// })();

logoutBtn.addEventListener('click', () => {
    window.sessionStorage.removeItem('access_token');
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
