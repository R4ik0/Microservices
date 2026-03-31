// Afficher le username depuis le token
const usernameDisplay = document.getElementById('usernameDisplay');
const logoutBtn = document.getElementById('logoutBtn');

const token = localStorage.getItem('access_token');

if (!token) {
    window.location.href = "index.html";
} else {
    // Décodage simple du JWT pour récupérer le username peut-être à exploiter pour voir si admin
    const payload = JSON.parse(atob(token.split('.')[1]));
    usernameDisplay.textContent = payload.sub;
    if (payload.role !== "admin") {
        document.getElementById("adminPanel").style.display = "none";
    }
}

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('access_token');
    window.location.href = "index.html";
});

const Charts = [];
['Accuracy', 'Loss', 'CPU', 'RAM'].forEach(metric => {
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
                    y: data[metrics[index]]
                });
            });
        } else if (data.library === "pytorch") {
            Charts.forEach((chart,index) => {
                chart.data.datasets[1].data.push({
                    x: data.elapsed_time,
                    y: data[metrics[index]]
                });
            });
        }

        Charts.forEach(chart => chart.update('none'));
    } else {
        console.log(`Training finished in ${data.training_time}s`);
    }
};

document.getElementById("startBtn")
    .addEventListener("click", startTraining);


// val_test = [{
//         "library": "keras",
//         "epoch": 1,
//         "accuracy": 0.8174999952316284,
//         "loss": 0.5211172699928284,
//         "cpu": 0,
//         "ram": 1090.140625,
//         "elapsed_time": 7.849256992340088
//         },
//         {
//         "library": "keras",
//         "epoch": 2,
//         "accuracy": 0.8624333143234253,
//         "loss": 0.385659784078598,
//         "cpu": 101.1,
//         "ram": 1097.109375,
//         "elapsed_time": 11.183424234390259
//         },
//         {
//         "library": "pytorch",
//         "epoch": 1,
//         "accuracy": 0.7804666666666666,
//         "loss": 156.306342959404,
//         "cpu": 10,
//         "ram": 673.8125,
//         "elapsed_time": 11.499288320541382
//         },
//         {
//         "library": "keras",
//         "epoch": 3,
//         "accuracy": 0.8743333220481873,
//         "loss": 0.3502722382545471,
//         "cpu": 99.3,
//         "ram": 1106.21484375,
//         "elapsed_time": 14.566609621047974
//         },
//         {
//         "library": "keras",
//         "epoch": 4,
//         "accuracy": 0.8814499974250793,
//         "loss": 0.3236920237541199,
//         "cpu": 100.5,
//         "ram": 1107.21484375,
//         "elapsed_time": 17.879421710968018
//         },
//         {
//         "library": "keras",
//         "epoch": 5,
//         "accuracy": 0.8881333470344543,
//         "loss": 0.30639803409576416,
//         "cpu": 98.9,
//         "ram": 1110.49609375,
//         "elapsed_time": 21.256349802017212
//         },
//         {
//         "library": "pytorch",
//         "epoch": 2,
//         "accuracy": 0.84475,
//         "loss": 105.23673850297928,
//         "cpu": 20,
//         "ram": 673.9375,
//         "elapsed_time": 21.39768362045288
//         },
//         {
//         "library": "pytorch",
//         "epoch": 3,
//         "accuracy": 0.8567666666666667,
//         "loss": 96.12021917104721,
//         "cpu": 19.9,
//         "ram": 673.9375,
//         "elapsed_time": 31.9073383808136
//         },
//         {
//         "library": "pytorch",
//         "epoch": 4,
//         "accuracy": 0.8661,
//         "loss": 89.906907081604,
//         "cpu": 10,
//         "ram": 674.4375,
//         "elapsed_time": 42.4883291721344
//         },
//         {
//         "library": "pytorch",
//         "epoch": 5,
//         "accuracy": 0.87345,
//         "loss": 84.62501126527786,
//         "cpu": 29.9,
//         "ram": 674.4375,
//         "elapsed_time": 53.59081220626831
//         }]



// metrics = ['accuracy', 'loss', 'cpu', 'ram'];


// function test2() {
//     for (let i = 0; i < val_test.length; i++) {
//         let data = val_test[i];
//         if (!data.training_time) {
//             if (data.library === "keras") {
//                 Charts.forEach((chart,index) => {
//                     chart.data.datasets[0].data.push({
//                         x: data.elapsed_time,
//                         y: data[metrics[index]]
//                     });
//                 });
//             } else if (data.library === "pytorch") {
//                 Charts.forEach((chart,index) => {
//                     chart.data.datasets[1].data.push({
//                         x: data.elapsed_time,
//                         y: data[metrics[index]]
//                     });
//                 });
//             }

//             Charts.forEach(chart => chart.update('none'));
//         } else {
//             console.log(`Training finished in ${data.training_time}s`);
//         }
//     }
// }

// document.getElementById("startBtn").addEventListener("click", test2);