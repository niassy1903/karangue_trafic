<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\Console\Input\Input;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Validation\ValidationException;
use App\Mail\ResetCodeMail;
use Illuminate\Support\Facades\Mail;


class UtilisateurController extends Controller
{
    public function index()
    {
        $utilisateurs = Utilisateur::all();
        return response()->json($utilisateurs);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'email' => 'required|email|unique:utilisateurs',
            'adresse' => 'required|string',
            'telephone' => 'required|string|unique:utilisateurs',
            'role' => 'required|in:agent de sécurité,administrateur'
        ]);

        $utilisateur = Utilisateur::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'adresse' => $request->adresse,
            'telephone' => $request->telephone,
            'code_secret' => rand(1000, 9999),
            'matricule' => strtoupper(Str::random(10)),
            'role' => $request->role,
            'carte_id' => null,
            'status' => 'actif'
        ]);

        return response()->json($utilisateur, 201);
    }

    public function show($id)
    {
        $utilisateur = Utilisateur::findOrFail($id);
        return response()->json($utilisateur);
    }

    public function update(Request $request, $id)
    {
        $utilisateur = Utilisateur::findOrFail($id);

        $request->validate([
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'email' => 'required|email|unique:utilisateurs,email,' . $utilisateur->id,
            'adresse' => 'required|string',
            'telephone' => 'required|string|unique:utilisateurs,telephone,' . $utilisateur->id,
            'role' => 'required|in:agent de sécurité,administrateur'
        ]);

        $utilisateur->update($request->all());

        return response()->json($utilisateur);
    }

    public function destroy($id)
    {
        Utilisateur::destroy($id);
        return response()->json(['message' => 'Utilisateur supprimé']);
    }

    public function destroyMultiple(Request $request)
    {
        $ids = $request->input('ids');
        Utilisateur::whereIn('id', $ids)->delete();
        return response()->json(['message' => 'Utilisateurs supprimés']);
    }

    public function block($id)
    {
        // Vérifier si l'utilisateur existe
        $utilisateur = Utilisateur::findOrFail($id);
    
        // Basculer le statut de l'utilisateur
        $nouveauStatut = ($utilisateur->status === 'actif') ? 'bloqué' : 'actif';
        $utilisateur->update(['status' => $nouveauStatut]);
    
        // Retourner un message approprié
        if ($nouveauStatut === 'bloqué') {
            return response()->json(['message' => 'Utilisateur bloqué']);
        } else {
            return response()->json(['message' => 'Utilisateur débloqué']);
        }
    }
    public function blockMultiple(Request $request)
{
    $ids = $request->input('ids');
    $utilisateurs = Utilisateur::whereIn('id', $ids)->get();

    foreach ($utilisateurs as $utilisateur) {
        // Basculer le statut de chaque utilisateur
        $nouveauStatut = ($utilisateur->status === 'actif') ? 'bloqué' : 'actif';
        $utilisateur->update(['status' => $nouveauStatut]);
    }

    return response()->json(['message' => 'Statut des utilisateurs mis à jour']);
}


    //Fonction pour authentifier un utilisateur
    public function authenticate(Request $request)
    {
        try {
            $request->validate([
                'code_secret' => 'required|integer|digits:4',
            ], [
                'code_secret.required' => 'Le code secret est obligatoire',
                'code_secret.integer' => 'Le code secret doit être numérique',
                'code_secret.digits' => 'Le code secret doit contenir exactement 4 chiffres',
            ]);
    
            $codeSecret = $request->input('code_secret');
            $utilisateur = Utilisateur::where('code_secret', $codeSecret)->first();
    
            if (!$utilisateur) {
                return response()->json([
                    'success' => false,
                    'message' => 'Identifiants invalides',
                    'errors' => ['code_secret' => 'Code secret incorrect']
                ], 401);
            }
    
            try {
                $token = JWTAuth::fromUser($utilisateur);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Connexion réussie',
                    'token' => $token,
                    'user' => [
                        'id' => $utilisateur->id,
                        'nom' => $utilisateur->nom
                    ]
                ], 200);
    
            } catch (JWTException $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur technique',
                    'errors' => ['server' => 'Impossible de générer le token']
                ], 500);
            }

            
    
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur inattendue',
                'errors' => ['server' => $e->getMessage()]
            ], 500);
        }
    }
    
    public function resetCodeSecret(Request $request)
    {
        // Valider l'email
        $request->validate([
            'email' => 'required|email',
        ]);
    
        // Vérifier si l'utilisateur existe
        $utilisateur = Utilisateur::where('email', $request->email)->first();
    
        if (!$utilisateur) {
            return response()->json(['message' => 'Email invalide ou inexistant.'], 404);
        }
    
        // Vérifier si l'utilisateur est bloqué
        if ($utilisateur->status === 'bloqué') {
            return response()->json(['message' => 'Votre compte est bloqué. Vous ne pouvez pas réinitialiser votre code secret.'], 403);
        }
    
        // Générer un nouveau code secret
        $newCode = rand(1000, 9999);
        $utilisateur->code_secret = $newCode;
        $utilisateur->save();
    
        // Envoyer le nouveau code par email en texte brut
        Mail::raw("Votre nouveau code secret est : $newCode", function ($message) use ($utilisateur) {
            $message->to($utilisateur->email)
                     ->subject('Votre nouveau code secret');
        });
    
        return response()->json(['message' => 'Veuillez vérifier votre email pour obtenir votre nouveau code secret.']);
    }
    
    public function assignerCarte(Request $request, $id)
{
    // Valider la requête pour s'assurer que l'ID de la carte est fourni
    $request->validate([
        'carte_id' => 'required|string',
    ]);

    // Vérifier si l'utilisateur existe
    $utilisateur = Utilisateur::findOrFail($id);

    // Vérifier si l'utilisateur est bloqué
    if ($utilisateur->status === 'bloqué') {
        return response()->json(['message' => 'Vous ne pouvez pas assigner une carte à un utilisateur bloqué.'], 403);
    }

    // Mettre à jour la carte_id de l'utilisateur
    $utilisateur->carte_id = $request->carte_id;
    $utilisateur->save();

    return response()->json(['message' => 'Carte assignée avec succès.']);
}


}
