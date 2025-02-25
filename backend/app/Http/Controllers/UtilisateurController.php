<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use App\Models\Historique;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class UtilisateurController extends Controller
{
    /**
     * Récupère tous les utilisateurs.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $utilisateurs = Utilisateur::all();
      
        return response()->json($utilisateurs);
    }

    /**
     * Crée un nouvel utilisateur.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validation des données de la requête
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'email' => 'required|email|unique:utilisateurs',
            'adresse' => 'required|string',
            'telephone' => 'required|string|unique:utilisateurs',
            'role' => 'required|in:agent de sécurité,administrateur,conducteur',
            'plaque_matriculation' => 'nullable|string|required_if:role,conducteur|unique:utilisateurs,plaque_matriculation'
        ], [
            "email" => "L'adresse email existe déjà",
            "telephone" => "Le numéro de téléphone existe déjà",
            'role.in' => 'Le rôle doit être soit "agent de sécurité", "administrateur" ou "conducteur".',
            "plaque_matriculation.required_if" => "La plaque d'immatriculation est requise pour le rôle de conducteur.",
            "plaque_matriculation.unique" => "La plaque d'immatriculation existe déjà."
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }
    
        // Génération d'un code secret aléatoire
        $codeSecret = rand(1000, 9999);
    
        // Génération du matricule en fonction du rôle
        $prefixes = [
            'agent de sécurité' => 'AG',
            'administrateur' => 'AD',
            'conducteur' => 'CO'
        ];
        
        $prefix = $prefixes[$request->role] ?? 'XX'; // Valeur par défaut si le rôle est inconnu
        $matricule = sprintf("%s-25-%03d", $prefix, rand(000, 999)); // Génération d'un numéro aléatoire à 3 chiffres
    
        // Création de l'utilisateur
        $utilisateur = Utilisateur::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'adresse' => $request->adresse,
            'telephone' => $request->telephone,
            'code_secret' => $codeSecret,
            'matricule' => $matricule,
            'role' => $request->role,
            'plaque_matriculation' => $request->plaque_matriculation,
            'carte_id' => null,
            'status' => 'actif',
        ]);
    
        // Envoi du code secret par email
        $this->sendCodeSecretEmail($utilisateur->email, $codeSecret);
    
        $this->logAction($utilisateur->id, 'Création d\'un utilisateur');
    
        return response()->json($utilisateur, 201);
    }
    
    /**
     * Envoie un email avec le code secret.
     *
     * @param string $email
     * @param int $codeSecret
     */
    protected function sendCodeSecretEmail($email, $codeSecret)
    {
        $loginUrl = config('app.app_url'); // Récupérer l'URL de connexion
    
        $messageContent = "Bienvenue sur KARANGUE TRAFIC !\n\n";
        $messageContent .= "Votre code secret pour vous connecter est : $codeSecret\n\n";
        $frontendUrl = config('app.frontend_url'); // Define the frontend URL
        $messageContent .= "Cliquez sur le lien suivant pour accéder à votre compte : $frontendUrl\n\n";
        $messageContent .= "Cordialement,\nL'équipe KARANGUE TRAFIC.";
    
        Mail::raw($messageContent, function ($message) use ($email) {
            $message->to($email)
                    ->subject('Votre Code Secret - KARANGUE TRAFIC');
        });
    }
    

    /**
     * Récupère un utilisateur par son ID.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $utilisateur = Utilisateur::findOrFail($id);
          
            return response()->json($utilisateur);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Utilisateur non trouvé.'], 404);
        }
    }

    /**
     * Met à jour un utilisateur.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $utilisateur = Utilisateur::findOrFail($id);

        // Validation des données de la requête
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

        // Mise à jour de l'utilisateur
        $utilisateur->update($request->all());

        $this->logAction($utilisateur->id, 'Mise à jour d\'un utilisateur');

        return response()->json($utilisateur);
    }

    /**
     * Supprime un utilisateur.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $utilisateur = Utilisateur::findOrFail($id);
            Utilisateur::destroy($id);
            $this->logAction($utilisateur->id, 'Suppression d\'un utilisateur');
            return response()->json(['message' => 'Utilisateur supprimé']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la suppression de l\'utilisateur.'], 500);
        }
    }

    /**
     * Supprime plusieurs utilisateurs.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroyMultiple(Request $request)
    {
        $ids = $request->input('ids');
        if (empty($ids)) {
            return response()->json(['message' => 'Aucun ID fourni.'], 400);
        }

        $utilisateurs = Utilisateur::whereIn('id', $ids)->get();
        Utilisateur::whereIn('id', $ids)->delete();

        foreach ($utilisateurs as $utilisateur) {
            $this->logAction($utilisateur->id, 'Suppression multiple d\'utilisateurs');
        }

        return response()->json(['message' => 'Utilisateurs supprimés']);
    }

    /**
     * Bloque ou débloque un utilisateur.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function block($id)
    {
        $utilisateur = Utilisateur::findOrFail($id);
        $nouveauStatut = ($utilisateur->status === 'actif') ? 'bloqué' : 'actif';
        $utilisateur->update(['status' => $nouveauStatut]);

        $this->logAction($utilisateur->id, $nouveauStatut === 'bloqué' ? 'Utilisateur bloqué' : 'Utilisateur débloqué');

        return response()->json(['message' => $nouveauStatut === 'bloqué' ? 'Utilisateur bloqué' : 'Utilisateur débloqué']);
    }

    /**
     * Bloque ou débloque plusieurs utilisateurs.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
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
            $this->logAction($utilisateur->id, $nouveauStatut === 'bloqué' ? 'Utilisateur bloqué' : 'Utilisateur débloqué');
        }

        return response()->json(['message' => 'Statut des utilisateurs mis à jour']);
    }

    /**
     * Authentifie un utilisateur.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
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
                        'prenom' => $utilisateur->prenom,
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

    /**
     * Déconnecte un utilisateur.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Réinitialise le code secret d'un utilisateur.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
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


    /**
     * Assigne une carte à un utilisateur.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
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

        $this->logAction($utilisateur->id, 'Assignation de carte');

        return response()->json(['message' => 'Carte assignée avec succès.']);
    }

    /**
     * Compte le nombre total d'utilisateurs.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function countUtilisateurs()
    {
        $count = Utilisateur::whereIn('role', ['administrateur', 'agent de sécurité', 'conducteur'])->count();
       
        return response()->json(['count' => $count]);
    }

    /**
     * Compte le nombre d'administrateurs.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function countAdministrateurs()
    {
        $count = Utilisateur::where('role', 'administrateur')->count();
      
        return response()->json(['count' => $count]);
    }



    /**
 * Compte le nombre d'agents de sécurité.
 *
 * @return \Illuminate\Http\JsonResponse
 */
public function countAgentsSecurite()
{
    $count = Utilisateur::where('role', 'agent de sécurité')->count();
  
    return response()->json(['count' => $count]);
}

/**
 * Compte le nombre de conducteurs.
 *
 * @return \Illuminate\Http\JsonResponse
 */
public function countConducteurs()
{
    $count = Utilisateur::where('role', 'conducteur')->count();
    
    return response()->json(['count' => $count]);
}

    /**
     * Importe des utilisateurs à partir d'un fichier CSV.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
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
                'role' => 'required|in:agent de sécurité,administrateur,conducteur',
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

            $this->logAction($utilisateur->id, 'Importation d\'un utilisateur');
        }

        // Retourner les résultats de l'importation
        return response()->json([
            'message' => 'Importation terminée.',
            'imported_users' => $importedUsers,
            'errors' => $errors,
        ], $errors ? 422 : 201);
    }

    /**
     * Enregistre une action dans l'historique.
     *
     * @param int $utilisateurId
     * @param string $action
     */
    private function logAction($utilisateurId, $action)
    {
        $utilisateur = auth()->user(); // Récupère l'utilisateur connecté
    
        Historique::create([
            'utilisateur_id' => $utilisateur->id,
            'action' => $action,
            'date' => Carbon::now()->format('d/m/Y'),
            'heure' => Carbon::now()->format('H:i'),
        ]);
    }

    /**
 * Vérifie si une plaque d'immatriculation existe dans la base de données.
 *
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse
 */
public function checkPlate(Request $request)
{
    $request->validate([
        'plaque_matriculation' => 'required|string',
    ], [
        'plaque_matriculation.required' => 'La plaque d\'immatriculation est obligatoire.',
    ]);

    $plaque = $request->input('plaque_matriculation');
    $utilisateur = Utilisateur::where('plaque_matriculation', $plaque)->first();

    if ($utilisateur) {
        // Si la plaque existe, retourner les informations de l'utilisateur
        return response()->json([
            'exists' => true,
            'utilisateur' => $utilisateur,
        ], 200);
    } else {
        // Si la plaque n'existe pas
        return response()->json([
            'exists' => false,
            'message' => 'Plaque d\'immatriculation non trouvée.',
        ], 404);
    }
}

    
}
