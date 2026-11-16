# 03 : Protocole d'évaluation et questionnaire SUS

## Objectif

Comparer les modalités MainLibre (voix, scanning mono-contacteur, clavier virtuel et menu RA/dwell) sur des tâches courtes, identifier les points de fatigue et recueillir une mesure d'utilisabilité. Aucun résultat n'est prérempli : les sessions doivent être réalisées par de vrais participants consentants.

## Précautions

- Expliquer le but, les données enregistrées et le droit d'arrêter à tout moment.
- Ne jamais attacher réellement la main d'un participant ni provoquer douleur, gêne respiratoire ou fatigue. Une simulation de limitation est volontaire, légère, consentie et interrompue à la demande.
- Ne collecter aucune donnée médicale nominative. Utiliser un identifiant pseudonyme et conserver les exports localement.
- Prévoir pauses, posture confortable et possibilité de demander de l'aide.

## Conditions de simulation

| Condition                           | Configuration de la session                                                   | Modalité visée                     | À observer                                                    |
| ----------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------- |
| Main attachée (simulation prudente) | Laisser la main dominante au repos ; utiliser seulement la modalité indiquée  | Voix et/ou contacteur non dominant | Effort, précision, erreurs, fatigue déclarée                  |
| Gants                               | Porter des gants confortables qui diminuent la précision, sans gêne ni danger | Cibles XL / contacteur             | Erreurs de sélection, taille et espacement                    |
| Voix seule                          | Désactiver scanning et navigation manuelle autant que possible                | Web Speech API fr-FR               | Reconnaissance, bruit, commandes comprises, solution de repli |
| Un bouton seul                      | Une touche unique (Espace par défaut) ; pas de souris pour la navigation      | ScanEngine groupe → éléments       | Temps, nombre de cycles, fatigue, erreurs                     |

Ces conditions sont des consignes de protocole, pas un handicap réel. Le labo enregistre la condition choisie, la tâche, le temps, les activations, les événements inattendus et les réponses SUS.

## Tâches scriptées

| ID  | Tâche                                   | Événement attendu                         |
| --- | --------------------------------------- | ----------------------------------------- |
| T1  | Ouvrir le clavier et saisir « bonjour » | `TEXT_CHANGED` avec texte final `bonjour` |
| T2  | Déclencher « appeler »                  | `ACTION_TRIGGERED` avec action `call`     |
| T3  | Demander de l'aide                      | `ACTION_TRIGGERED` avec action `help`     |
| T4  | Activer la lumière simulée              | `ACTION_TRIGGERED` avec action `light`    |

L'application capture les actions et permet l'export JSON/CSV du journal. Le temps est chronométré entre le démarrage et l'achèvement de la tâche ; les activations et erreurs proviennent des événements reçus par le bus. Les résultats ne sont interprétables qu'avec un protocole constant et des participants informés.

## Tableau des résultats : volontairement vide

| Participant pseudonyme | Condition | Tâche | Temps (s) | Erreurs | Activations | SUS /100 | Notes qualitatives |
| ---------------------- | --------- | ----- | --------: | ------: | ----------: | -------: | ------------------ |
|                        |           |       |           |         |             |          |                    |
|                        |           |       |           |         |             |          |                    |
|                        |           |       |           |         |             |          |                    |
|                        |           |       |           |         |             |          |                    |

## SUS : version française

Après les tâches, demander une réponse de 1 (pas du tout d'accord) à 5 (tout à fait d'accord) pour chacune des 10 affirmations ci-dessous. Pour calculer le score SUS : pour les items impairs, soustraire 1 à la réponse ; pour les items pairs, soustraire la réponse à 5 ; additionner les contributions puis multiplier par 2,5. Le résultat va de 0 à 100. Il ne s'agit pas d'un pourcentage de réussite.

1. Je pense que j'aimerais utiliser ce système fréquemment.
2. J'ai trouvé le système inutilement complexe.
3. J'ai trouvé le système facile à utiliser.
4. Je pense que j'aurais besoin de l'aide d'une personne technique pour utiliser ce système.
5. J'ai trouvé les différentes fonctions du système bien intégrées.
6. J'ai trouvé qu'il y avait trop d'incohérences dans ce système.
7. Je pense que la plupart des personnes apprendraient à utiliser ce système très rapidement.
8. J'ai trouvé le système très contraignant à utiliser.
9. Je me suis senti en confiance en utilisant le système.
10. J'ai dû apprendre beaucoup de choses avant de pouvoir utiliser le système.

La formulation française ci-dessus est fournie pour l'étude du prototype ; conserver le même libellé pour tous les participants. Ne pas attribuer de score SUS si une réponse manque.
