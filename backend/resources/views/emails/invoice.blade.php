<!DOCTYPE html>
<html>
<head>
    <title>Facture de paiement d'amende</title>
</head>
<body>
    <h1>Facture de paiement d'amende</h1>
    <p>Prénom: {{ $infraction->prenom_conducteur }}</p>
    <p>Nom: {{ $infraction->nom_conducteur }}</p>
    <p>Plaque: {{ $infraction->plaque_matriculation }}</p>
    <p>Date: {{ $infraction->date }}</p>
    <p>Heure: {{ $infraction->heure }}</p>
    <p>Montant: {{ $infraction->montant }}</p>
    <p>Agent: Agent ID: 12345</p>
</body>
</html>
