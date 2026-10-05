# CRM Contacts Tableur

Un tableau de bord CRM full-stack performant permettant de gérer des contacts et des colonnes dynamiques avec virtualisation, filtres et tri côté serveur.

---

## 🚀 Préréquis et Lancement de l'application

L'application est entièrement dockerisée et pilotée via le `Makefile`.

1. **Démarrer l'ensemble des services (Database, Backend, Frontend) :**
   ```bash
   cp .env.example .env
   make up

	```

L'application est accessible à l'adresse suivante :

 http://localhost

2. **Arrêter les conteneurs :**
```bash
   make down

```

3. **Nettoyage complet (conteneurs, volumes, images, node_modules) :**
```bash
make clean

```

---

## 🌱 Initialisation de la base et données de démonstration

Pour remplir la base de données avec **500 contacts fictifs** (avec valeurs aléatoires pour chaque colonne dynamique) :

```bash
make up
make seed
make psql
```

```SQL
\dt

\d contacts
\d columns


SELECT COUNT(*) FROM contacts;
SELECT * FROM columns;
\q
```

---

## 🛠️ Principaux choix techniques

* **Backend (NestJS / TypeScript / TypeORM) :**
* PostgreSQL avec stockage des données dynamiques au format `JSONB`.
* Pagination par curseur (keyset pagination) pour garantir des performances optimales lors du défilement.
* Requêtes SQL natives optimisées (`buildListQuery`) pour exécuter les tris et filtres directement en BDD.


* **Frontend (React / Vite / TypeScript) :**
* **TanStack Virtual (`@tanstack/react-virtual`) :** Virtualisation de la grille pour ne rendre que les lignes visibles dans le DOM.
* **TanStack Query (`@tanstack/react-query`) :** Gestion de l'état asynchrone, du cache et du chargement infini (`useInfiniteQuery`).


* **Orchestration :**
* Docker Compose pour l'isolation des services et Makefile pour la gestion des commandes usuelles.



---

## ✅ Fonctionnalités terminées et ⚠️ Limites connues

### Fonctionnalités terminées :

* [x] Affichage des contacts sous forme de grille virtualisée.
* [x] Chargement progressif automatique via **scroll infini**.
* [x] Création, édition directe en cellule (Inline Edition) et suppression des contacts.
* [x] Tri et filtrage multi-critères exécutés côté serveur sur l'intégralité du dataset.
* [x] Gestion dynamique des colonnes (Ajout, suppression, via double-clic, réorganisation).
* [x] Prise en charge des types de colonnes : `texte`, `nombre`, `date`, `téléphone`.
* [x] Persistence complète des données, des valeurs et de la structure des colonnes après rechargement.
* [x] Script de seed automatisé (600 contacts).

### Limites connues :

* Rennomage des colonnes
* Possibilité de mettre des lettres dans une colonne numéro

---

## 🎯 Améliorations prioritaires

* Rennomage des colonnes
* Validation correcte de chiffres si colonne numéro

---

## 🤖 Outils d'IA utilisés

* **Gemini / Claude :** Assistance à la conception d'architecture, au débogage des requêtes SQL JSONB PostgreSQL, à la création des fichiers et review du code.

---

## ⏱️ Temps approximatif
Entre 4h et 4h15 mins
