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
}

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('access_token');
    window.location.href = "index.html";
});
