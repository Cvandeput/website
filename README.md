# Portfolio — Corentin Vandeput

Portfolio personnel d'un étudiant en informatique (Belgique). Site statique présentant mes compétences, mes projets et un formulaire de contact fonctionnel.

🔗 **En ligne** : https://www.devNco.be

## Stack

- HTML / CSS
- Tailwind CSS (via CDN)
- JavaScript (vanilla)
- PHP (envoi du formulaire de contact, `send-email.php`)

## Structure

```
.
└── personnal-portfolio/
    ├── index.html          # Page principale (about, skills, projects, contact)
    ├── contact.html        # Formulaire de contact
    ├── script.js           # Validation + envoi du formulaire
    ├── send-email.php      # Traitement serveur de l'envoi d'e-mail
    ├── style.css           # Styles custom (hover, animations)
    ├── logo.svg            # Logo
    ├── logo.png            # Favicon
    └── DEPLOY-SSH-GUIDE.md # Guide de déploiement
```

## Développement local

Le site est statique, mais le formulaire de contact nécessite PHP. Pour tout tester
en local, sers le dossier avec PHP :

```bash
cd personnal-portfolio
php -S localhost:8000
```

Sans PHP, le reste du site fonctionne avec n'importe quel serveur statique
(`python3 -m http.server`), mais l'envoi du formulaire échouera.

## Formulaire de contact

Validation côté client (`script.js`), envoi côté serveur (`send-email.php`).
Le serveur de production doit avoir PHP activé et `mail()` fonctionnel.

## Déploiement

Voir `personnal-portfolio/DEPLOY-SSH-GUIDE.md`.

## Auteur

Corentin Vandeput — IT Student, Belgium.
