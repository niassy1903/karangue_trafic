<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model as Eloquent;

class Police extends Eloquent
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'polices';

    protected $fillable = [
        'nom',
    ];

    /**
     * Relation avec les utilisateurs.
     */
    public function utilisateurs()
    {
        return $this->hasMany(Utilisateur::class, 'police_id', '_id');
    }

    public function infractions()
    {
        return $this->hasMany(Infraction::class, 'police_id', '_id');
    }
}
