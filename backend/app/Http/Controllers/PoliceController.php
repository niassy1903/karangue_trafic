<?php

namespace App\Http\Controllers;

use App\Models\Police;
use Illuminate\Http\Request;

class PoliceController extends Controller
{
    public function index()
    {
        $polices = Police::all();
        return response()->json($polices);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nom' => 'required|string',
        ]);

        $police = Police::create($validatedData);
        return response()->json($police, 201);
    }

    public function show($id)
    {
        $police = Police::findOrFail($id);
        return response()->json($police);
    }

    public function update(Request $request, $id)
    {
        $police = Police::findOrFail($id);
        $validatedData = $request->validate([
            'nom' => 'required|string',
        ]);

        $police->update($validatedData);
        return response()->json($police);
    }

    public function destroy($id)
    {
        $police = Police::findOrFail($id);
        $police->delete();
        return response()->json(['message' => 'Police supprimée']);
    }
}
