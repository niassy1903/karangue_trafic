<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class UtilisateurController extends Controller
{
    public function index()
    {
        $utilisateurs = Utilisateur::all();
        return response()->json($utilisateurs);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'email' => 'required|email|unique:utilisateurs',
            'adresse' => 'required|string',
            'telephone' => 'required|string|unique:utilisateurs',
            'role' => 'required|in:agent de sécurité,administrateur,conducteur',
            'plaque_matriculation' => 'nullable|string|required_if:role,conducteur'
        ], [
            'role.in' => 'Le rôle doit être soit "agent de sécurité", "administrateur" ou "conducteur".',
            "plaque_matriculation.required_if" => "La plaque d'immatriculation est requise pour le rôle de conducteur."
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $codeSecret = rand(1000, 9999);

        $utilisateur = Utilisateur::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'adresse' => $request->adresse,
            'telephone' => $request->telephone,
            'code_secret' => $codeSecret,
            'matricule' => strtoupper(Str::random(10)),
            'role' => $request->role,
            'plaque_matriculation' => $request->plaque_matriculation,
            'carte_id' => null,
            'status' => 'actif',
        ]);

        $this->sendCodeSecretEmail($utilisateur->email, $codeSecret);

        return response()->json($utilisateur, 201);
    }
    protected function sendCodeSecretEmail($email, $codeSecret)
    {
        Mail::raw("Votre code secret est : $codeSecret", function ($message) use ($email) {
            $message->to($email)
                    ->subject('Votre Code Secret');
        });
    }
    public function show($id)
    {
        try {
            $utilisateur = Utilisateur::findOrFail($id);
            return response()->json($utilisateur);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Utilisateur non trouvé.'], 404);
        }
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
        ], [
            'nom.required' => 'Le nom est obligatoire.',
            'prenom.required' => 'Le prénom est obligatoire.',
            'email.required' => 'L\'email est obligatoire.',
            'email.unique' => 'Cet email est déjà utilisé.',
            'adresse.required' => 'L\'adresse est obligatoire.',
            'telephone.required' => 'Le téléphone est obligatoire.',
            'telephone.unique' => 'Ce numéro de téléphone est déjà utilisé.',
            'role.required' => 'Le rôle est obligatoire.',
            'role.in' => 'Le rôle doit être soit "agent de sécurité" soit "administrateur".',
        ]);

        $utilisateur->update($request->all());

        return response()->json($utilisateur);
    }

    public function destroy($id)
    {
        try {
            Utilisateur::destroy($id);
            return response()->json(['message' => 'Utilisateur supprimé']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la suppression de l\'utilisateur.'], 500);
        }
    }

    public function destroyMultiple(Request $request)
    {
        $ids = $request->input('ids');
        if (empty($ids)) {
            return response()->json(['message' => 'Aucun ID fourni.'], 400);
        }

        Utilisateur::whereIn('id', $ids)->delete();
        return response()->json(['message' => 'Utilisateurs supprimés']);
    }

    public function block($id)
    {
        $utilisateur = Utilisateur::findOrFail($id);
        $nouveauStatut = ($utilisateur->status === 'actif') ? 'bloqué' : 'actif';
        $utilisateur->update(['status' => $nouveauStatut]);

        return response()->json(['message' => $nouveauStatut === 'bloqué' ? 'Utilisateur bloqué' : 'Utilisateur débloqué']);
    }

    public function blockMultiple(Request $request)
    {
        $ids = $request->input('ids');
        if (empty($ids)) {
            return response()->json(['message' => 'Aucun ID fourni.'], 400);
        }

        $utilisateurs = Utilisateur::whereIn('id', $ids)->get();
        foreach ($utilisateurs as $utilisateur) {
            $nouveauStatut = ($utilisateur->status === 'actif') ? 'bloqué' : 'actif';
            $utilisateur->update(['status' => $nouveauStatut]);
        }

        return response()->json(['message' => 'Statut des utilisateurs mis à jour']);
    }

    public function authenticate(Request $request)
{
    try {
        $request->validate([
            'code_secret' => 'required|integer|digits:4',
        ], [
            'code_secret.required' => 'Le code secret est obligatoire.',
            'code_secret.integer' => 'Le code secret doit être numérique.',
            'code_secret.digits' => 'Le code secret doit contenir exactement 4 chiffres.',
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
            // Ajouter le rôle dans le token
            $token = JWTAuth::claims(['role' => $utilisateur->role])->fromUser($utilisateur);

            return response()->json([
                'success' => true,
                'message' => 'Connexion réussie',
                'token' => $token,
                'user' => [
                    'id' => $utilisateur->id,
                    'nom' => $utilisateur->nom,
                    'role' => $utilisateur->role
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

    public function logout(Request $request)
    {
        try {
            // Invalider le token actuel
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['message' => 'Déconnexion réussie'], 200);
        } catch (JWTException $e) {
            return response()->json(['message' => 'Erreur lors de la déconnexion'], 500);
        }
    }

    public function resetCodeSecret(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'L\'email est obligatoire.',
            'email.email' => 'L\'email doit être valide.',
        ]);

        $utilisateur = Utilisateur::where('email', $request->email)->first();

        if (!$utilisateur) {
            return response()->json(['message' => 'Email invalide ou inexistant.'], 404);
        }

        if ($utilisateur->status === 'bloqué') {
            return response()->json(['message' => 'Votre compte est bloqué. Vous ne pouvez pas réinitialiser votre code secret.'], 403);
        }

        $newCode = rand(1000, 9999);
        $utilisateur->code_secret = $newCode;
        $utilisateur->save();

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
        ], [
            'carte_id.required' => 'L\'ID de la carte est obligatoire.',
        ]);
    
        // Vérifier si l'utilisateur existe
        $utilisateur = Utilisateur::findOrFail($id);
    
        // Vérifier si l'utilisateur est bloqué
        if ($utilisateur->status === 'bloqué') {
            return response()->json(['message' => 'Vous ne pouvez pas assigner une carte à un utilisateur bloqué.'], 403);
        }
    
        // Vérifier si la carte est déjà assignée à un autre utilisateur
        $carteExistante = Utilisateur::where('carte_id', $request->carte_id)
                                      ->where('id', '<>', $id)
                                      ->exists();
    
        if ($carteExistante) {
            return response()->json(['message' => 'Cette carte est déjà assignée à un autre utilisateur.'], 409);
        }
    
        // Mettre à jour la carte_id de l'utilisateur
        $utilisateur->carte_id = $request->carte_id;
        $utilisateur->save();
    
        return response()->json(['message' => 'Carte assignée avec succès.']);
    }
    

    public function countUtilisateurs()
    {
        $count = Utilisateur::whereIn('role', ['administrateur', 'agent de sécurité', 'conducteur'])->count();
        return response()->json(['count' => $count]);
    }

    public function countAdministrateurs()
    {
        $count = Utilisateur::where('role', 'administrateur')->count();
        return response()->json(['count' => $count]);
    }

    public function importCsv(Request $request)
    {
        // Valider la présence du fichier CSV dans la requête
        $request->validate([
            'csv_file' => 'required|mimes:csv,txt|max:2048',
        ], [
            'csv_file.required' => 'Le fichier CSV est obligatoire.',
            'csv_file.mimes' => 'Le fichier doit être au format CSV ou TXT.',
            'csv_file.max' => 'La taille du fichier ne doit pas dépasser 2 Mo.',
        ]);

        // Lire le fichier CSV
        $file = $request->file('csv_file');
        $csvData = file($file->getRealPath());

        $importedUsers = [];
        $errors = [];

        // Parcourir chaque ligne du fichier CSV
        foreach ($csvData as $index => $row) {
            if ($index === 0) {
                // Ignorer la première ligne si elle contient des en-têtes
                continue;
            }

            $rowData = str_getcsv($row);

            // Valider les données de chaque ligne
            $validator = Validator::make([
                'nom' => $rowData[0],
                'prenom' => $rowData[1],
                'email' => $rowData[2],
                'adresse' => $rowData[3],
                'telephone' => $rowData[4],
                'role' => $rowData[5],
            ], [
                'nom' => 'required|string',
                'prenom' => 'required|string',
                'email' => 'required|email|unique:utilisateurs',
                'adresse' => 'required|string',
                'telephone' => 'required|string|unique:utilisateurs',
                'role' => 'required|in:agent de sécurité,administrateur',
            ]);

            // Si la validation échoue, ajouter les erreurs au tableau
            if ($validator->fails()) {
                $errors[] = $validator->errors();
                continue;
            }

            // Générer un code secret et un matricule
            $codeSecret = rand(1000, 9999);
            $matricule = strtoupper(Str::random(10));

            // Créer l'utilisateur
            $utilisateur = Utilisateur::create([
                'nom' => $rowData[0],
                'prenom' => $rowData[1],
                'email' => $rowData[2],
                'adresse' => $rowData[3],
                'telephone' => $rowData[4],
                'code_secret' => $codeSecret,
                'matricule' => $matricule,
                'role' => $rowData[5],
                'carte_id' => null,
                'status' => 'actif',
            ]);

            // Envoyer le code secret par email
            $this->sendCodeSecretEmail($utilisateur->email, $codeSecret);

            // Ajouter l'utilisateur importé à la liste
            $importedUsers[] = $utilisateur;
        }

        // Retourner les résultats de l'importation
        return response()->json([
            'message' => 'Importation terminée.',
            'imported_users' => $importedUsers,
            'errors' => $errors,
        ], $errors ? 422 : 201);
    }

}

