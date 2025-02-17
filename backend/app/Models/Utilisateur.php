<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model as Eloquent;
use Tymon\JWTAuth\Contracts\JWTSubject;

class Utilisateur extends Eloquent implements JWTSubject
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'utilisateurs';

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'adresse',
        'telephone',
        'code_secret',
        'matricule',
        'role',
        'carte_id',
        'status'
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}
