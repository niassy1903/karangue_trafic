<?php
return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:4200', 'https://karangue-trafic.netlify.app', 
    'https://notification-y4ln.onrender.com', 'https://anpr-1bix.onrender.com', 
        'https://rfid-api-4p9q.onrender.com'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
