## Voraussetzungen:
- git ist installiert (git-scm.com)
- node und npm sind installiert (https://nodejs.org/)
- grunt-cli ist global installiert ( [sudo] npm install grunt-cli -g )

### Erste Schritte:
Im obersten Ordner des Projekts folgendes eingeben
```sh
npm install
```

Danach müssen alle Bilder des graphischen Authentifizierungsverfahrens kopiert werden
```sh
grunt copy
```

Zuletzt einfach den Server starten (nicht mehr mit "sails lift")
```sh
node app.js
```

## Umgebungsvariablen setzen:
Mit Umgebungsvariablen können wir alle Konfigurationen, die sich bei verschiedenen Entwicklern unterscheiden (beispielsweise die Zugangsdaten zur Datenbank) aus dem Git-Repository halten.
Wir benutzten dazu dotenv, ein kleines Plugin, dass den Inhalt einer .env-Datei vor dem Server-Start als Umgebungsvariablen lädt. 
Dazu einfach den Inhalt der .env-Datei im root-Ordner des Projekts anpassen:
```
DB_HOST=host.url
DB_PORT=your.port
DB_USER=your.user
DB_PASSWORD=your.password
DB_NAME=your.db

SMTP_CONFIG={"service":"Gmail","auth":{"user":"some-email","pass":"somepassword"}}
MAIL_FROM=your@mail
CERTIFICATE_MAIL=your@mail
JWT_SECRET=some_jwt_secret
EMAIL_HAS_TO_BE_CONFIRMED=false
URL_LOCAL=http://localhost:1337
URL_APP=http://localhost:4200
```