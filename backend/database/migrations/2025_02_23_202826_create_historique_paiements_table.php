<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateHistoriquePaiementsTable extends Migration
{
    public function up()
    {
        Schema::create('historique_paiements', function (Blueprint $table) {
            $table->id();
            $table->string('infraction_id');
            $table->string('utilisateur_id'); // Ajoutez ce champ
            $table->string('action');
            $table->string('date');
            $table->string('heure');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('historique_paiements');
    }
};
