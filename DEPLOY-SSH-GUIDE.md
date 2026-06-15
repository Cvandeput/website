# 🚀 Déploiement via SSH sur VPS Hostinger

## 1️⃣ Connexion SSH

### Depuis PowerShell (Windows)

```powershell
ssh votre-utilisateur@devworks.be
# ou avec l'IP directement
ssh votre-utilisateur@xxx.xxx.xxx.xxx
```

**Informations de connexion** (trouvables dans votre panel Hostinger) :

- **Host**: `devworks.be` ou l'adresse IP de votre VPS
- **Port**: `22` (par défaut)
- **Username**: votre nom d'utilisateur Hostinger
- **Password**: votre mot de passe VPS

---

## 2️⃣ Déploiement via Git (Méthode recommandée)

### Configuration initiale sur le VPS

```bash
# 1. Se connecter au VPS
ssh votre-utilisateur@devworks.be

# 2. Aller dans le dossier web
cd /home/votre-utilisateur/public_html
# ou
cd /var/www/html

# 3. Si Git n'est pas installé
sudo apt update
sudo apt install git -y

# 4. Cloner votre repository
git clone https://github.com/Coco-Lapin/website.git .
# Le point (.) clone directement dans le dossier courant

# 5. Configurer les permissions
chmod 644 *.html *.css *.js *.php
chmod 755 .
```

### Mises à jour futures

```bash
# Se connecter au VPS
ssh votre-utilisateur@devworks.be

# Aller dans le dossier
cd /home/votre-utilisateur/public_html

# Récupérer les dernières modifications
git pull origin main
```

---

## 3️⃣ Configuration de l'email PHP

### Option A: Test rapide avec mail()

```bash
# 1. Éditer le fichier PHP
nano send-email.php

# 2. Modifier la ligne avec votre email
# Cherchez: $to = 'votre-email@devworks.be';
# Remplacez par votre vraie adresse

# 3. Sauvegarder: Ctrl+O, Enter, Ctrl+X

# 4. Tester si mail() fonctionne
php -r "if(mail('votre-email@devworks.be', 'Test', 'Test')) echo 'OK'; else echo 'FAIL';"
```

### Option B: Installer PHPMailer (si mail() ne fonctionne pas)

```bash
# 1. Vérifier si Composer est installé
composer --version

# 2. Si pas installé, installer Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# 3. Installer PHPMailer
cd /home/votre-utilisateur/public_html
composer require phpmailer/phpmailer

# 4. Créer/éditer send-email.php avec PHPMailer
nano send-email.php
```

---

## 4️⃣ Configuration email Hostinger

### Créer une adresse email via SSH (API Hostinger)

Pour créer l'email via le panel web Hostinger :

1. Allez dans votre panel Hostinger
2. Section **Emails**
3. Créez `noreply@devworks.be`
4. Notez le mot de passe

### Ou via ligne de commande (si cPanel/WHM disponible)

```bash
# Si vous avez accès à WHM/cPanel
uapi --user=votre-utilisateur Email add_pop \
  email=noreply \
  password='VotreMotDePasse123!' \
  quota=250
```

---

## 5️⃣ Fichier send-email.php avec PHPMailer (complet)

Créez ce fichier via SSH :

```bash
nano send-email.php
```

Collez ce code :

```php
<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

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

$mail = new PHPMailer(true);

try {
    // Configuration SMTP Hostinger
    $mail->isSMTP();
    $mail->Host       = 'smtp.hostinger.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'noreply@devworks.be';
    $mail->Password   = 'VOTRE_MOT_DE_PASSE_EMAIL_ICI';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet    = 'UTF-8';

    // Destinataires
    $mail->setFrom('noreply@devworks.be', 'DevWorks Contact');
    $mail->addAddress('votre-email-reception@devworks.be'); // VOTRE EMAIL ICI
    $mail->addReplyTo($email, $name);

    // Contenu
    $mail->isHTML(true);
    $mail->Subject = 'Nouveau message de contact depuis devworks.be';
    $mail->Body    = "
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
        </div>
    </body>
    </html>
    ";

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Message envoyé avec succès']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur: ' . $mail->ErrorInfo]);
}
?>
```

Sauvegardez avec `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 6️⃣ Vérification et tests

### Test PHP

```bash
# Vérifier la version PHP
php -v

# Tester si le fichier PHP est valide (syntaxe)
php -l send-email.php

# Vérifier les permissions
ls -la send-email.php
```

### Test d'envoi d'email simple

```bash
# Test rapide de la fonction mail()
php -r "mail('votre-email@devworks.be', 'Test VPS', 'Test depuis SSH');"

# Vérifier les logs d'erreur
tail -f /var/log/apache2/error.log
# ou
tail -f /var/log/nginx/error.log
```

### Tester le formulaire

```bash
# Depuis votre machine locale, testez avec curl
curl -X POST https://devworks.be/send-email.php \
  -d "name=Test User" \
  -d "email=test@example.com" \
  -d "message=Ceci est un message de test de plus de 10 caractères"
```

---

## 7️⃣ Automatisation avec GitHub Actions (Bonus)

Créez `.github/workflows/deploy.yml` dans votre repo :

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          password: ${{ secrets.VPS_PASSWORD }}
          script: |
            cd /home/votre-utilisateur/public_html
            git pull origin main
            composer install --no-dev
```

Ajoutez les secrets dans GitHub :

- `VPS_HOST`: devworks.be
- `VPS_USERNAME`: votre username
- `VPS_PASSWORD`: votre password

---

## 🔧 Commandes utiles SSH

```bash
# Voir les processus PHP
ps aux | grep php

# Redémarrer Apache
sudo systemctl restart apache2

# Redémarrer Nginx
sudo systemctl restart nginx

# Voir les logs en temps réel
tail -f /var/log/apache2/error.log

# Vérifier l'espace disque
df -h

# Permissions correctes pour les fichiers web
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
```

---

## 🐛 Dépannage

### Le site ne s'affiche pas

```bash
# Vérifier que les fichiers sont au bon endroit
ls -la /home/votre-utilisateur/public_html/

# Vérifier les permissions
ls -la index.html

# Vérifier la configuration Apache/Nginx
sudo apache2ctl configtest
# ou
sudo nginx -t
```

### Les emails ne partent pas

```bash
# Vérifier les logs PHP
tail -f /var/log/php-fpm.log

# Tester SMTP avec telnet
telnet smtp.hostinger.com 587

# Vérifier les ports ouverts
sudo netstat -tulpn | grep :587
```

---

## 📝 Checklist finale

- [ ] Connexion SSH fonctionnelle
- [ ] Git installé sur le VPS
- [ ] Repository cloné dans public_html
- [ ] send-email.php configuré avec votre email
- [ ] Composer + PHPMailer installés (si nécessaire)
- [ ] Email noreply@devworks.be créé dans le panel Hostinger
- [ ] Mot de passe SMTP configuré dans send-email.php
- [ ] Permissions des fichiers correctes (644 pour fichiers, 755 pour dossiers)
- [ ] Test du formulaire effectué
- [ ] Email de test reçu

---

Bon déploiement ! 🚀
