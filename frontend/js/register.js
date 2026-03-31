const form = document.getElementById('registerForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const first_name = document.getElementById('first_name').value;
    const last_name = document.getElementById('last_name').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:8001/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password,
                role: "user", // rôle par défaut
                first_name,
                last_name
            })
        });

        const data = await response.json();

        if (response.ok) {
            message.style.color = 'green';
            message.textContent = "Compte créé avec succès ! Redirection vers la connexion...";
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
        } else {
            message.style.color = 'red';
            message.textContent = data.detail || "Erreur lors de la création du compte";
        }
    } catch (err) {
        message.style.color = 'red';
        message.textContent = "Erreur réseau";
    }
});