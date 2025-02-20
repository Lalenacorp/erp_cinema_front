# Étape 1: Utiliser une image de base Node.js
FROM node:18 AS builder

# Étape 2: Définir le répertoire de travail
WORKDIR /app

# Étape 3: Copier les fichiers de package.json et package-lock.json
COPY package*.json ./

# Étape 4: Installer les dépendances
RUN npm install

# Étape 5: Copier le reste des fichiers de l'application
COPY . .

# Étape 6: Construire l'application
RUN npm run build

# Étape 7: Utiliser une image Nginx pour servir les fichiers statiques
FROM nginx:alpine

# Étape 8: Copier les fichiers construits dans le répertoire Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Étape 9: Exposer le port 80
EXPOSE 80

# Étape 10: Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
