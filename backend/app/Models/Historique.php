<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model as Eloquent;

class Historique extends Eloquent
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'historiques';

    protected $fillable = ['utilisateur_id', 'action', 'date', 'heure'];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }
}
