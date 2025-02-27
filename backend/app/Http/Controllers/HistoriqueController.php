<?php

namespace App\Http\Controllers;

use App\Models\Historique;
use Illuminate\Http\Request;

class HistoriqueController extends Controller
{
    public function index()
    {
        $historiques = Historique::with('utilisateur:id,nom,prenom,matricule')->get();
        return response()->json($historiques);
    }
    
    public function show($id)
    {
        $historique = Historique::with('utilisateur:id,nom,prenom,matricule')->findOrFail($id);
        return response()->json($historique);
    }
    
}
