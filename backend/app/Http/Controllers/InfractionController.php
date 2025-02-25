<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Infraction;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use App\Models\HistoriquePaiement;

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

        $infraction = Infraction::create($validatedData);

        // Envoyer la notification au serveur Node.js
        Http::post('http://localhost:3000/send-notification', [
            'message' => 'Nouvelle infraction détectée',
            'conducteur' => $validatedData['nom_conducteur'] . ' ' . $validatedData['prenom_conducteur'],
            'plaque' => $validatedData['plaque_matriculation'],
            'vitesse' => $validatedData['vitesse'],
            'date' => $validatedData['date'],
            'heure' => $validatedData['heure'],
        ]);

        return response()->json(['message' => 'Infraction enregistrée', 'data' => $infraction], 201);
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

    public function payerAmende(Request $request, $id) {
        $validatedData = $request->validate([
            'montant' => 'required|numeric',
            'utilisateur_id' => 'required|string',
            'agent_nom' => 'nullable|string',
            'agent_prenom' => 'nullable|string'
        ]);
        
        $infraction = Infraction::findOrFail($id);
        $infraction->montant = $validatedData['montant'];
        $infraction->status = 'payé';
        $infraction->save();
        
        // Créez directement l'historique avec les informations de l'agent
        $date = Carbon::now()->format('d/m/Y');
        $heure = Carbon::now()->format('H:i');
        
        HistoriquePaiement::create([
            'infraction_id' => $id,
            'utilisateur_id' => $validatedData['utilisateur_id'],
            'action' => 'Paiement enregistré',
            'date' => $date,
            'heure' => $heure,
            'agent_prenom' => $validatedData['agent_prenom'] ?? 'Agent',
            'agent_nom' => $validatedData['agent_nom'] ?? 'Sécurité'
        ]);
        
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


}