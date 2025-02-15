<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

use App\Http\Controllers\UtilisateurController;

Route::get('/utilisateurs', [UtilisateurController::class, 'index']);
Route::post('/utilisateurs', [UtilisateurController::class, 'store']);
Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'destroy']);

Route::post('/utilisateurs/deleteMultiple', [UtilisateurController::class, 'destroyMultiple']);



Route::put('/utilisateurs/block/{id}', [UtilisateurController::class, 'block']);
Route::put('/utilisateurs/block', [UtilisateurController::class, 'blockMultiple']);
