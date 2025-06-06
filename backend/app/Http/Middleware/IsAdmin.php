<?php

namespace App\Http\Middleware;



use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $utilisateur = Auth::guard('utilisateur')->user();

        if (!$utilisateur || $utilisateur->role !== 'administrateur') {
            return response()->json(['message' => 'Accès refusé. Seuls les administrateurs sont autorisés.'], 403);
        }

        return $next($request);
    }
}
