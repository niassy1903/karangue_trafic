<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UtilisateurController;

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

    // Réinitialisation du code secret d'un utilisateur
    Route::post('/utilisateurs/reset-code', [UtilisateurController::class, 'resetCodeSecret']);

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

    /*
    |--------------------------------------------------------------------------
    | Importation des utilisateurs
    |--------------------------------------------------------------------------
    */

    // Importe des utilisateurs depuis un fichier CSV
    Route::post('/utilisateurs/import', [UtilisateurController::class, 'importCsv']);
});

// Authentifie un utilisateur (cette route ne nécessite pas d'être protégée par le middleware IsAdmin)
Route::post('/utilisateurs/authenticate', [UtilisateurController::class, 'authenticate']);

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
