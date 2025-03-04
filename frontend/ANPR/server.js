const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(bodyParser.json({ limit: '50mb' })); // Augmenter la limite de taille pour les images

// Chemin du dossier images
const imagesDir = path.join(__dirname, 'images');

// Créer le dossier 'images' s'il n'existe pas
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// Tableau pour stocker les plaques récemment détectées avec un timestamp
let detectedPlates = [];

function isPlateDetectedRecently(plate) {
    const currentTime = Date.now();
    
    // Filtrer les plaques détectées dans les 5 dernières minutes
    detectedPlates = detectedPlates.filter(plateData => currentTime - plateData.timestamp < 5 * 60 * 1000); 
    
    // Vérifier si la plaque existe dans la liste filtrée
    return detectedPlates.some(plateData => plateData.plate === plate);
}

app.post('/receive-plate', async (req, res) => {
    const { plate, speed, image } = req.body;
    console.log(`Plaque reçue : ${plate}, Vitesse : ${speed} km/h`);

    // Vérifier si la plaque a été détectée récemment
    if (isPlateDetectedRecently(plate)) {
        console.log(`Plaque ${plate} déjà enregistrée récemment.`);
        return res.status(200).send({ message: "Plaque déjà enregistrée récemment." });
    }

    // Vérification de la vitesse
    if (speed <= 8.0) {
        console.log(`Vitesse de ${plate} est inférieure ou égale à 30 km/h, aucune infraction enregistrée.`);
        return res.status(200).send({ message: "Vitesse insuffisante pour enregistrer une infraction." });
    }

    try {
        // Sauvegarder l'image
        const imageBuffer = Buffer.from(image, 'base64');
        const imagePath = path.join(imagesDir, `${plate}_${Date.now()}.jpg`);
        fs.writeFileSync(imagePath, imageBuffer);

        // Vérification de la plaque dans la base de données via l'API
        const response = await axios.post('http://127.0.0.1:8000/api/check-plate', { plaque_matriculation: plate });
        console.log('Réponse de l\'API check-plate:', response.data);

        if (response.data.exists) {
            console.log(`Plaque ${plate} trouvée :`, response.data.utilisateur);
            const utilisateur = response.data.utilisateur;

            // Création des données pour l'infraction
            const now = new Date();
            const date = now.toLocaleDateString('fr-FR');
            const heure = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

            const infractionData = {
                nom_conducteur: utilisateur.nom,
                prenom_conducteur: utilisateur.prenom,
                plaque_matriculation: utilisateur.plaque_matriculation,
                telephone: utilisateur.telephone,
                vitesse: speed,  // Vitesse réelle détectée
                date: date,
                heure: heure,
                image_path: imagePath  // Chemin de l'image enregistrée
            };

            console.log('Données d\'infraction à enregistrer :', infractionData);

            // Enregistrer l'infraction via l'API
            const infractionResponse = await axios.post('http://127.0.0.1:8000/api/enregistrer-infraction', infractionData);
            console.log('Réponse après enregistrement de l\'infraction:', infractionResponse.data);

            // Ajout de la plaque aux plaques récemment détectées
            detectedPlates.push({ plate, timestamp: Date.now() });

            res.status(200).send({ message: "Infraction enregistrée", utilisateur });
        } else {
            console.log('Plaque non trouvée');
            res.status(404).send({ message: "Plaque non trouvée" });
        }
    } catch (error) {
        console.error('Erreur:', error.message);
        res.status(500).send({ message: 'Erreur serveur' });
    }
});

app.listen(port, () => {
    console.log(`Serveur Node.js en écoute sur le port ${port}`);
});