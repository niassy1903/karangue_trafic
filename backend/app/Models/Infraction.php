<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model as Eloquent;

class Infraction extends Eloquent
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'infractions';

    protected $fillable = [
        'nom_conducteur',
        'prenom_conducteur',
        'telephone',
        'plaque_matriculation',
        'vitesse',
        'date',
        'heure',
        'status',
        'montant',
        'police_id', // Ajout de la relation avec la police
    ];

    protected $attributes = [
        'status' => 'non payé',
        'montant' => null,
    ];

    // Relation avec la police
    public function police()
    {
        return $this->belongsTo(Police::class, 'police_id', '_id');
    }

    
}
