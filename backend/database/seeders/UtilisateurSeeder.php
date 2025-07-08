<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Utilisateur;

class UtilisateurSeeder extends Seeder
{
    public function run(): void
    {
        $utilisateurs = [
            [
                'nom' => 'Niassy',
                'prenom' => 'Lamine',
                'email' => 'niassy.lamine10@gmail.com',
                'adresse' => 'Dakar',
                'telephone' => '770000001',
                'role' => 'administrateur',
            ],
            [
                'nom' => 'Niassy',
                'prenom' => 'Mouhamadou Lamine',
                'email' => 'mouhamadoulamineniassy@gmail.com',
                'adresse' => 'Dakar',
                'telephone' => '770000002',
                'role' => 'agent de sécurité',
                'police_id' => 1, // à adapter selon votre table police
            ],
            [
                'nom' => 'Niassy',
                'prenom' => 'Mamadou Lamine',
                'email' => 'mamadoulamineniassy22@gmail.com',
                'adresse' => 'Dakar',
                'telephone' => '770000003',
                'role' => 'agent de sécurité',
                'police_id' => 1,
            ],
            [
                'nom' => 'Projet',
                'prenom' => 'T',
                'email' => 'tprojet59@gmail.com',
                'adresse' => 'Dakar',
                'telephone' => '770000004',
                'role' => 'administrateur',
            ]
        ];

        foreach ($utilisateurs as $data) {
            Utilisateur::updateOrCreate(
                ['email' => $data['email']],
                array_merge($data, [
                    'code_secret' => rand(1000, 9999),
                    'matricule' => self::generateMatricule($data['role']),
                    'status' => 'actif',
                    'plaque_matriculation' => null,
                    'carte_id' => null,
                ])
            );
        }
    }

    private static function generateMatricule($role)
    {
        $prefix = [
            'administrateur' => 'AD',
            'agent de sécurité' => 'AG',
            'conducteur' => 'CO'
        ][$role] ?? 'XX';

        return sprintf("%s-25-%03d", $prefix, rand(1, 999));
    }
}
