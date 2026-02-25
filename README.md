# Platform APEX - CICADA

Une plateforme éducative moderne et performante, conçue pour la gestion des cours, des examens et des annonces pour les étudiants de la plateforme CF.

## 🚀 Fonctionnalités
- ✨ **Design Premium** : Interface moderne avec effet Glassmorphism et fond sombre élégant.
- 📢 **Annonces Dynamiques** : Support des textes, images et notes vocales (style WhatsApp).
- 📚 **Gestion des Niveaux** : Organisation par niveaux d'études (SMP1, SMP2, etc.).
- 📁 **Ressources** : Accès simplifié aux cours, TD, TP et examens.
- 💬 **Contact Rapide** : Bouton WhatsApp intégré pour le support CICADA.

## 🛠️ Technologies
- **Frontend** : React.js, Vite, Tailwind CSS, Framer Motion.
- **Backend** : Supabase (Database, Auth, Storage).
- **Icons** : Lucide React.

## 📦 Installation & Déploiement

1. **Cloner le projet**
   ```bash
   git clone <url-du-repo>
   cd cf
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Variables d'environnement**
   Créez un fichier `.env` avec vos clés Supabase :
   ```env
   VITE_SUPABASE_URL=votre_url
   VITE_SUPABASE_ANON_KEY=votre_cle
   ```

4. **Lancer en local**
   ```bash
   npm run dev
   ```

5. **Déploiement**
   Connectez votre repo GitHub à **Vercel** ou **Netlify** pour un déploiement automatique.

---
Développé avec ❤️ par la team.
