# Hlasování

Semestrální práce na 4IT573 Základy Node.js

### Popis:

Aplikace na hlasování a hodnocení věcí ve skupině lidí.
- uživatel se musí registrovat a přihlásit
- každý přihlášený uživatel může hlasovat a vytvářet nové ankety
- každý může hlasovat kolikrát chce v kterékoliv anketě
- vytvářená anketa může mít 1 až 30 možností
- anketu může smazat jen její autor 

### Spuštění:

```
npm install
npx knex migrate:latest
npm run dev
```
