<?php
return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:4200', 'https://karangue-frontend.onrender.com', 
    'https://karangue-notification-api.onrender.com', 'https://karangue-anpr-api.onrender.com', 
        'https://karangue-connexion-rfid.onrender.com'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
