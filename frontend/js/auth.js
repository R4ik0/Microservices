const form = document.getElementById('loginForm');
const message = document.getElementById('message');
const createAccountBtn = document.getElementById('createAccountBtn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('access_token', data.access_token);
            window.location.href = "dashboard.html"; // redirection après connexion
        } else {
            message.style.color = 'red';
            message.textContent = "Nom d'utilisateur ou mot de passe incorrect";
        }
    } catch (err) {
        message.style.color = 'red';
        message.textContent = "Erreur réseau";
    }
});

// Redirection vers la page d'inscription
createAccountBtn.addEventListener('click', () => {
    window.location.href = "register.html";
});