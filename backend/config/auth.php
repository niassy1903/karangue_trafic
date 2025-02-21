<?php

return [

    'defaults' => [
        'guard' => 'utilisateur', // Utilisez 'utilisateur' comme guard par défaut
        'passwords' => 'utilisateurs', // Utilisez 'utilisateurs' comme provider par défaut pour les mots de passe
    ],

    'guards' => [
        'utilisateur' => [
            'driver' => 'jwt', // Utilisez 'jwt' si vous utilisez JWT pour l'authentification
            'provider' => 'utilisateurs',
        ],
    ],

    'providers' => [
        'utilisateurs' => [
            'driver' => 'eloquent',
            'model' => App\Models\Utilisateur::class,
        ],
    ],

    'passwords' => [
        'utilisateurs' => [
            'provider' => 'utilisateurs',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => 10800,

];

