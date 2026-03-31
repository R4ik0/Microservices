# Projet de benchmark Deep Learning distribué

## Présentation

Ce projet a pour objectif de comparer l'exécution de deux frameworks de deep learning dans une architecture distribuée :

- Keras
- PyTorch

Les entraînements sont lancés automatiquement au démarrage des conteneurs Docker.  
L'utilisateur n'intervient pas sur le choix du modèle : il peut uniquement consulter les résultats et l'évolution des métriques via l'interface.

---

## Architecture générale

L'architecture repose sur plusieurs services reliés entre eux :

- une interface utilisateur pour visualiser les résultats,
- une API centrale pour faire circuler les informations,
- Kafka pour la communication entre services,
- des services d'exécution des modèles,
- une base de données pour les utilisateurs,
- une base de logs pour stocker les métriques.

Les services Keras et PyTorch exécutent chacun leur entraînement, envoient leurs métriques via Kafka, puis les résultats sont affichés sous forme de graphiques.

Schéma de l'architecture :  
https://drive.google.com/file/d/1XIMfSFXhHHwsRJaIia87MEJ2koxCjTxE/view?usp=sharing

---

## Comptes de test

username : Thibz  
password : userpass  

username : Admin1  
password : adminpass  

---

## Lancement

Le projet se lance avec Docker :

```bash
docker compose up --build
```

Une fois lancé, les modèles commencent automatiquement leur entraînement et les métriques deviennent visibles dans l'interface.
