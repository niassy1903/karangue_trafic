<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Str;



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


    public function destroy($id)
    {
        Utilisateur::destroy($id);
        return response()->json(['message' => 'Utilisateur supprimé']);
    }

    
    public function destroyMultiple(Request $request)
    {
        $ids = $request->input('ids'); // Liste des IDs envoyée
    
        // Supprimer les utilisateurs
        Utilisateur::whereIn('id', $ids)->delete();
        
        return response()->json(['message' => 'Utilisateurs supprimés']);
    }
    
    

    public function block($id)
    {
        $utilisateur = Utilisateur::findOrFail($id);
        $utilisateur->update(['status' => 'bloqué']);
        return response()->json(['message' => 'Utilisateur bloqué']);
    }

    public function blockMultiple(Request $request)
    {
        Utilisateur::whereIn('id', $request->ids)->update(['status' => 'bloqué']);
        return response()->json(['message' => 'Utilisateurs bloqués']);
    }

    
}
