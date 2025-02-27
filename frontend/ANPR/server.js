const io = require("socket.io-client");
const axios = require("axios");

// Connexion au serveur Flask
const socket = io("http://127.0.0.1:5000");

let highConfidencePlate = null;

socket.on("connect", () => {
    console.log("✅ Connecté au serveur Flask.");
});

socket.on("plate_detected", async (data) => {
    console.log(`🚗 Plaque détectée : ${data.plate}, Confiance : ${data.confidence}`);

    // Vérifier si la confiance est de 99% ou plus
    if (parseFloat(data.confidence) >= 99) {
        console.log(`🚨 Plaque détectée avec 99% de précision !`);

        // Stocker la plaque avec une haute confiance
        highConfidencePlate = data.plate;

        try {
            // Appeler l'API Laravel pour vérifier la plaque
            const response = await axios.post('http://127.0.0.1:8000/api/check-plate', {
                plaque_matriculation: highConfidencePlate
            });

            if (response.data.exists) {
                // Si la plaque existe, enregistrer l'infraction
                console.log('Plaque trouvée :', response.data.utilisateur);
                // Appeler la méthode enregistrerInfraction ici
                enregistrerInfraction(response.data.utilisateur);
            } else {
                console.log('Plaque non trouvée.');
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de la plaque :', error);
        }
    }
});

socket.on("disconnect", () => {
    console.log("❌ Déconnecté du serveur Flask.");
});

async function enregistrerInfraction(utilisateur) {
    // Obtenir la date et l'heure actuelles
    const now = new Date();
    const date = now.toLocaleDateString('fr-FR'); // Format dd/mm/yyyy
    const heure = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); // Format hh:mm

    // Données nécessaires pour enregistrer l'infraction
    const infractionData = {
        nom_conducteur: utilisateur.nom,
        prenom_conducteur: utilisateur.prenom,
        plaque_matriculation: utilisateur.plaque_matriculation,
        vitesse: 120, // Exemple de vitesse, à ajuster selon vos besoins
        date: date,
        heure: heure,
    };

    try {
        // Appeler l'API Laravel pour enregistrer l'infraction
        const response = await axios.post('http://127.0.0.1:8000/api/enregistrer-infraction', infractionData);
        console.log('Infraction enregistrée :', response.data);
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'infraction :', error);
    }
}
