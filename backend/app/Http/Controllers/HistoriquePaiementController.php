<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HistoriquePaiement;

class HistoriquePaiementController extends Controller
{
    public function index()
    {
        $historiquePaiements = HistoriquePaiement::with(['infraction', 'utilisateur'])->get();
        return response()->json(['data' => $historiquePaiements]);
    }

    public function show($id)
    {
        $historiquePaiement = HistoriquePaiement::with(['infraction', 'utilisateur'])->where('infraction_id', $id)->get();
        return response()->json(['data' => $historiquePaiement]);
    }
}