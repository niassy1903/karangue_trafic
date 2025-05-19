<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre Code Secret - KARANGUE TRAFIC</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #ddd;
        }
        .header h1 {
            color: #fd7401;
        }
        .content {
            padding: 20px 0;
        }
        .image-container {
            text-align: center;
            margin: 20px 0;
        }
        .image-container img {
            max-width: 100%;
            height: auto;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #fd7401;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 10px;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
<div class="container">
        <div class="header">
            <h1>Bienvenue sur KARANGUE TRAFIC !</h1>
        </div>
        <div class="content">
            <p>Bonjour,</p>
            <p>Votre code secret pour vous connecter est : <strong>{{ $codeSecret }}</strong></p>
            <p>Cliquez sur le bouton ci-dessous pour accéder à votre compte :</p>
            
            <p><a href="{{ $frontendUrl }}" class="button">Accéder à mon compte</a></p>
            <p>Cordialement,</p>
            <p>L'équipe KARANGUE TRAFIC</p>

            <!-- Image juste après l'équipe KARANGUE TRAFIC -->
            <div class="image-container">
                <img src="{{ asset('images/trafic.png') }}" alt="Illustration">
            </div>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} KARANGUE TRAFIC. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
