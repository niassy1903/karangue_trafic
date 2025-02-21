<?php

namespace App\Http\Controllers;

use App\Models\Historique;
use Illuminate\Http\Request;

class HistoriqueController extends Controller
{
    public function index()
    {
        $historiques = Historique::with('utilisateur')->get();
        return response()->json($historiques);
    }

    public function show($id)
    {
        $historique = Historique::with('utilisateur')->findOrFail($id);
        return response()->json($historique);
    }
}
