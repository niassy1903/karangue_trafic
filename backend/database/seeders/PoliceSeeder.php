<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Police;

class PoliceSeeder extends Seeder
{
    /**
     * Liste des polices du Sénégal.
     */
    protected $polices = [
        'Direction Générale de la Police Nationale',
        'Brigade des Stupéfiants',
        'Division des Investigations Criminelles (DIC)',
        'Brigade d’Intervention Polyvalente (BIP)',
        'Police des Frontières',
        'Police de l’Air et des Frontières',
        'Police Judiciaire',
        'Compagnie de Circulation Routière',
        'Unité de la Sûreté Urbaine',
        'Brigade de Recherches',
        'Brigade des Mineurs',
        'Brigade des Mœurs',
        'Police de proximité',
        'Unité Mobile d’Intervention',
        'Office Central de Répression du Trafic Illicite des Stupéfiants (OCRTIS)',
        'Office Central pour la Répression de la Traite des Personnes',
        'Commissariat Central de Dakar',
        'Commissariat de Pikine',
        'Commissariat de Guédiawaye',
        'Commissariat de Thiès',
        'Commissariat de Saint-Louis',
        'Commissariat de Ziguinchor',
        'Commissariat de Kaolack',
        'Commissariat de Tambacounda',
        'Commissariat de Kolda',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->polices as $nom) {
            Police::create(['nom' => $nom]);
        }
    }
}
