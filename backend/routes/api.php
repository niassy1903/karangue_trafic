<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UtilisateurController;
use App\Http\Controllers\HistoriqueController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Définition des routes API pour la gestion des utilisateurs.
| Ces routes sont chargées par le RouteServiceProvider et assignées
| au groupe de middleware "api".
|
*/

// Route protégée nécessitant une authentification via Sanctum
Route::middleware('auth:utilisateur')->get('/user', function (Request $request) {
    return $request->user();
});

/*
|--------------------------------------------------------------------------
| Routes pour la gestion des utilisateurs
|--------------------------------------------------------------------------
*/

Route::middleware(['isAdmin'])->group(function (){
    // Liste tous les utilisateurs
    Route::get('/utilisateurs', [UtilisateurController::class, 'index']);

    // Crée un nouvel utilisateur
    Route::post('/utilisateurs', [UtilisateurController::class, 'store']);

    // Affiche les détails d'un utilisateur spécifique
    Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'show']);

    // Met à jour les informations d'un utilisateur spécifique
    Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update']);

    // Supprime un utilisateur spécifique
    Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'destroy']);

    // Supprime plusieurs utilisateurs en une seule requête
    Route::post('/utilisateurs/deleteMultiple', [UtilisateurController::class, 'destroyMultiple']);

    // Bloque un utilisateur spécifique
    Route::put('/utilisateurs/block/{id}', [UtilisateurController::class, 'block']);

    // Bloque plusieurs utilisateurs en une seule requête
    Route::post('/utilisateurs/block-multiple', [UtilisateurController::class, 'blockMultiple']);

   
    // Assigne une carte à un utilisateur spécifique
    Route::put('/utilisateurs/{id}/assigner-carte', [UtilisateurController::class, 'assignerCarte']);

    /*
    |--------------------------------------------------------------------------
    | Routes pour les statistiques des utilisateurs
    |--------------------------------------------------------------------------
    */

    // Compte le nombre total d'utilisateurs
    Route::get('/utilisateurs/users/count', [UtilisateurController::class, 'countUtilisateurs']);

    // Compte le nombre d'administrateurs
    Route::get('/utilisateurs/administrateurs/count', [UtilisateurController::class, 'countAdministrateurs']);
    // Compte le nombre d'agents de sécurité
    Route::get('/utilisateurs/agents-securite/count', [UtilisateurController::class, 'countAgentsSecurite']);
    // Compte le nombre de conducteurs
    Route::get('/utilisateurs/conducteurs/count', [UtilisateurController::class, 'countConducteurs']);

    /*
    |--------------------------------------------------------------------------
    | Importation des utilisateurs
    |--------------------------------------------------------------------------
    */

    // Importe des utilisateurs depuis un fichier CSV
    Route::post('/utilisateurs/import', [UtilisateurController::class, 'importCsv']);

    // Voir les logs de l'application
    Route::get('/historiques', [HistoriqueController::class, 'index']);

    //voir l'historique d'un utilisateur à partir de son id
    Route::get('/historiques/{id}', [HistoriqueController::class, 'show']);

 

});

  

// Authentifie un utilisateur (cette route ne nécessite pas d'être protégée par le middleware IsAdmin)
Route::post('/utilisateurs/authenticate', [UtilisateurController::class, 'authenticate']);

 // Réinitialisation du code secret d'un utilisateur
 Route::post('/utilisateurs/reset-code', [UtilisateurController::class, 'resetCodeSecret']);


// Route pour la déconnexion
Route::middleware('auth:utilisateur')->post('/utilisateurs/logout', [UtilisateurController::class, 'logout']);

/*
|--------------------------------------------------------------------------
| Route de secours pour les endpoints inexistants
|--------------------------------------------------------------------------
*/

Route::fallback(function(){
    return response()->json([
        'success' => false,
        'message' => 'Endpoint non trouvé',
        'errors' => ['url' => 'URL invalide ou non prise en charge']
    ], 404);
});


use App\Http\Controllers\InfractionController;

Route::post('/enregistrer-infraction', [InfractionController::class, 'enregistrerInfraction']);
Route::post('/payer-amende/{id}', [InfractionController::class, 'payerAmende']);
Route::get('/infractions-par-periode', [InfractionController::class, 'infractionsParPeriode']);
Route::get('/toutes-infractions', [InfractionController::class, 'obtenirToutesInfractions']);
Route::get('/infractions-avec-pagination', [InfractionController::class, 'obtenirInfractionsAvecPagination']);
