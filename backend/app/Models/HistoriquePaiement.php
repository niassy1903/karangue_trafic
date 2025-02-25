<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model as Eloquent;

class HistoriquePaiement extends Eloquent
{
    use HasFactory;

    protected $connection = 'mongodb'; // Assurez-vous que cette connexion est définie dans votre fichier de configuration
    protected $collection = 'historique_paiements'; // Nom de la collection dans MongoDB

    protected $fillable = [
        'infraction_id',
        'utilisateur_id', // Ajoutez ce champ
        'action',
        'date',
        'heure',
    ];

    public function infraction()
    {
        return $this->belongsTo(Infraction::class, 'infraction_id');
    }

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }
}