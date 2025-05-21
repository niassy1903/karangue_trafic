<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model as Eloquent;

class HistoriquePaiement extends Eloquent
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'historique_paiements';

    protected $fillable = [
        'infraction_id',
        'utilisateur_id',
        'action',
        'date',
        'montant',
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
