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

    public function payerAmende(Request $request, $id)
    {
        $validatedData = $request->validate([
            'montant' => 'required|numeric',
            'utilisateur_id' => 'required|exists:utilisateurs,id', // Ajoutez cette validation
        ]);
    
        $infraction = Infraction::findOrFail($id);
        $infraction->montant = $validatedData['montant'];
        $infraction->status = 'payé';
        $infraction->save();
    
        // Enregistrer l'action de paiement dans HistoriquePaiement
        HistoriquePaiement::create([
            'infraction_id' => $infraction->id,
            'utilisateur_id' => $validatedData['utilisateur_id'],
            'action' => 'paiement éffectué avec succès',
            'date' => now()->format('Y-m-d'),
            'heure' => now()->format('H:i:s'),
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