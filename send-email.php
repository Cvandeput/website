<?php
// Configuration des en-têtes CORS et sécurité
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Si c'est une requête OPTIONS (preflight), on répond immédiatement
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Vérifier que c'est bien une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

// Récupérer les données du formulaire
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

// Validation côté serveur
$errors = [];

if (strlen($name) < 2) {
    $errors[] = 'Le nom doit contenir au moins 2 caractères';
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'L\'adresse email n\'est pas valide';
}

if (strlen($message) < 10 || strlen($message) > 500) {
    $errors[] = 'Le message doit contenir entre 10 et 500 caractères';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
    exit;
}

// Configuration de l'email
$to = 'vdp.corentin@gmail.com'; // REMPLACEZ par votre vrai email
$subject = 'Nouveau message de contact depuis devworks.be';

// Créer le corps de l'email en HTML
$emailBody = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #13a4ec; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f4f4f4; padding: 20px; margin: 20px 0; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #13a4ec; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Nouveau message de contact</h2>
        </div>
        <div class='content'>
            <div class='field'>
                <span class='label'>Nom:</span> " . htmlspecialchars($name) . "
            </div>
            <div class='field'>
                <span class='label'>Email:</span> " . htmlspecialchars($email) . "
            </div>
            <div class='field'>
                <span class='label'>Message:</span><br>
                " . nl2br(htmlspecialchars($message)) . "
            </div>
        </div>
        <div class='footer'>
            <p>Ce message a été envoyé depuis le formulaire de contact de devworks.be</p>
        </div>
    </div>
</body>
</html>
";

// En-têtes pour l'email
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type: text/html; charset=UTF-8" . "\r\n";
$headers .= "From: noreply@devworks.be" . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Tentative d'envoi de l'email
try {
    if (mail($to, $subject, $emailBody, $headers)) {
        // Succès
        echo json_encode([
            'success' => true,
            'message' => 'Message envoyé avec succès'
        ]);
    } else {
        // Échec de l'envoi
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de l\'envoi du message'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ]);
}
?>