<?php 

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Infraction;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use App\Models\HistoriquePaiement;
use App\Models\Police;

class InfractionController extends Controller
{
    public function obtenirToutesInfractions()
    {
        $infractions = Infraction::all();
        return response()->json(['data' => $infractions]);
    }

    public function enregistrerInfraction(Request $request)
    {
        $validatedData = $request->validate([
            'nom_conducteur' => 'required|string',
            'prenom_conducteur' => 'required|string',
            'plaque_matriculation' => 'required|string',
            'vitesse' => 'required|integer',
            'date' => 'required|date_format:d/m/Y',
            'heure' => 'required|date_format:H:i',
        ]);

        // Par défaut, associer la police de Dakar
        $policeDakar = Police::where('nom', 'Commissariat de Police de Dakar')->first();
        $validatedData['police_id'] = $policeDakar->id;

        // Création de l'infraction avec la police associée
        $infraction = Infraction::create($validatedData);

        // Envoyer une notification au serveur Node.js
        Http::post('http://localhost:3000/send-notification-to-police', [
            'police_id' => $policeDakar->id, // Identifiant unique de la police
            'message' => 'Nouvelle infraction détectée',
            'conducteur' => $validatedData['nom_conducteur'] . ' ' . $validatedData['prenom_conducteur'],
            'plaque' => $validatedData['plaque_matriculation'],
            'vitesse' => $validatedData['vitesse'],
            'date' => $validatedData['date'],
            'heure' => $validatedData['heure']
        ]);

        return response()->json(['message' => 'Infraction enregistrée', 'data' => $infraction], 201);
    }

    public function transfererNotification(Request $request)
    {
        $validatedData = $request->validate([
            'infraction_id' => 'required|exists:infractions,_id',
            'new_police_id' => 'required|exists:polices,_id',
        ]);

        // Trouver l'infraction et la police source
        $infraction = Infraction::findOrFail($validatedData['infraction_id']);

        // Vérifier si l'infraction a une police associée
        $currentPolice = $infraction->police;

        if (!$currentPolice) {
            return response()->json(['message' => 'Aucune police associée à cette infraction.'], 400);
        }

        // Vérifier si la police actuelle est la même que la nouvelle police
        if ($currentPolice->id == $validatedData['new_police_id']) {
            return response()->json(['message' => 'Cette infraction est déjà attribuée à cette police.'], 400);
        }

        // Trouver la nouvelle police
        $newPolice = Police::findOrFail($validatedData['new_police_id']);

        // Transférer l'infraction à la nouvelle police
        $infraction->police_id = $newPolice->id;
        $infraction->save();

        // Optionnel : Enregistrer le transfert dans un historique
        // HistoriqueTransfert::create([
        //     'infraction_id' => $infraction->id,
        //     'ancien_police_id' => $currentPolice->id,
        //     'nouveau_police_id' => $newPolice->id,
        //     'date_transfert' => now(),
        // ]);

        // Envoyer la notification au serveur Node.js
      // Envoyer la notification au serveur Node.js pour informer la nouvelle police
     Http::post('http://localhost:3000/send-notification-to-police', [
    'police_id' => $newPolice->id, // Identifiant unique de la nouvelle police
    'message' => 'Infraction transférée à votre unité',
    'conducteur' => $infraction->nom_conducteur . ' ' . $infraction->prenom_conducteur,
    'plaque' => $infraction->plaque_matriculation,
    'vitesse' => $infraction->vitesse,
    'date' => $infraction->date,
    'heure' => $infraction->heure
]);


        return response()->json(['message' => 'Infraction transférée avec succès', 'data' => $infraction], 200);
    }

  
    public function payerAmende(Request $request, $id) {
        $validatedData = $request->validate([
            'montant' => 'required|numeric',
            'utilisateur_id' => 'required|exists:utilisateurs,id', // Ajoutez cette validation
        ]);
    
        $infraction = Infraction::findOrFail($id);
        $infraction->montant = $validatedData['montant'];
        $infraction->status = 'payé';
        $infraction->save();
    
        // Utiliser la fonction logPaiementAction pour enregistrer l'action de paiement
        $this->logPaiementAction($infraction->id, $validatedData['utilisateur_id'], 'paiement effectué avec succès');
    
        return response()->json(['message' => 'Paiement enregistré']);
    }
    

    

    public function infractionsParPeriode(Request $request)
    {
        $validatedData = $request->validate([
            'periode' => 'required|in:jour,semaine,mois',
        ]);

        $periode = $validatedData['periode'];
        $today = Carbon::today();

        switch ($periode) {
            case 'jour':
                $infractions = Infraction::whereDate('created_at', $today)->get();
                break;
            case 'semaine':
                $infractions = Infraction::whereBetween('created_at', [$today->startOfWeek(), $today->endOfWeek()])->get();
                break;
            case 'mois':
                $infractions = Infraction::whereMonth('created_at', $today->month)->get();
                break;
        }

        return response()->json(['count' => $infractions->count(), 'data' => $infractions]);
    }

    public function obtenirInfractionsAvecPagination(Request $request)
    {
        $perPage = $request->query('per_page', 10); // Nombre d'éléments par page
        $page = $request->query('page', 1); // Page actuelle
        $infractions = Infraction::orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);

        return response()->json(['data' => $infractions]);
    }

    private function logPaiementAction($infractionId, $utilisateurId, $action)
    {
        $date = Carbon::now()->format('d/m/Y');
        $heure = Carbon::now()->format('H:i');

        HistoriquePaiement::create([
            'infraction_id' => $infractionId,
            'utilisateur_id' => $utilisateurId, // Enregistrer l'ID de l'utilisateur
            'action' => $action,
            'date' => $date,
            'heure' => $heure,
        ]);
    }
}
