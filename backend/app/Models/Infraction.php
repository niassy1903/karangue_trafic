<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model as Eloquent;

class Infraction extends Eloquent
{
    use HasFactory;

    protected $connection = 'mongodb'; // Assurez-vous que cette connexion est définie dans votre fichier de configuration
    protected $collection = 'infractions'; // Nom de la collection dans MongoDB

    protected $fillable = [
        'nom_conducteur',
        'prenom_conducteur',
        'plaque_matriculation',
        'vitesse',
        'date',
        'heure',
        'status',
        'montant',
    ];

    protected $attributes = [
        'status' => 'non payé',
        'montant' => null,
    ];
}
