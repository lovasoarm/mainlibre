# 02 : Persona RA-accessible : Alessia

## Profil fictif

**Alessia, 19 ans**, présente une dystrophie musculaire. Ce persona reprend l'exemple proposé dans le sujet ; il ne représente pas toutes les personnes ayant cette pathologie et ne constitue pas une description médicale.

- **Contexte :** utilise un ordinateur portable à domicile et souhaite accéder à des fonctions simples sans dépendre de mouvements précis des doigts.
- **Capacités et limites motrices retenues pour la conception :** fatigue accrue lors d'actions répétitives, faible endurance des mouvements fins, difficulté possible à maintenir un geste. Ces éléments sont des hypothèses de design à valider avec la personne concernée.
- **Objectifs :** saisir un court message, appeler à l'aide, activer une lumière simulée et naviguer dans un menu flottant.
- **Frustrations anticipées :** cibles trop petites, commandes qui expirent vite, geste non annulable, nécessité de répéter une action ou de tenir une posture longtemps.
- **Préférences configurables :** grandes cibles, contraste élevé, scanning lent, pauses automatiques, dwell plus long, possibilité de choisir voix ou contacteur.

## Scénario d'usage

Alessia ouvre MainLibre. Le profil Alessia active automatiquement les grandes cibles, le thème contrasté, un scanning lent avec pause anti-fatigue et un dwell long. Elle peut ouvrir le clavier avec la voix, ou utiliser un contacteur unique pour parcourir les groupes puis les lettres. Pour le prototype RA, elle calibre une pose neutre, puis maintient la tête vers une cible ; après le délai de dwell, le menu déclenche l'action simulée. La souris sert de solution de démonstration lorsque la caméra n'est pas disponible.

## Matrice besoin → fonctionnalité → critère

| Besoin / risque              | Fonction MainLibre                                      | Critère associé                                              |
| ---------------------------- | ------------------------------------------------------- | ------------------------------------------------------------ |
| Limiter les mouvements fins  | Scanning ligne → colonne et mono-bouton                 | WCAG 2.1.1, 2.5.8                                            |
| Éviter la fatigue            | Vitesse réglable, pauses automatiques                   | WCAG 2.2.1 et bonne pratique de contrôle du temps            |
| Réduire les erreurs motrices | Dwell annulable avant activation et cible surlignée     | WCAG 2.5.2, 2.4.7                                            |
| Contrôler sans les mains     | Voix fr-FR et tête via MediaPipe                        | Alternatives de modalité ; tests utilisateurs indispensables |
| Repérer les commandes        | Contraste élevé, cibles XL, focus doublement indiqué    | WCAG 1.4.3, 1.4.11, 2.4.7, 2.5.8                             |
| Garder le contrôle           | Arrêt micro/caméra, pause, retour, réglages modifiables | WCAG 2.1.2, 2.2.1                                            |

## Preset réellement appliqué

Le profil est une configuration persistée et modifiable, pas uniquement une fiche documentaire :

- taille de cible : 64 px (XL) ;
- intervalle scanning : 1 800 ms ;
- délai avant premier élément : 2 400 ms ;
- pause après : 3 cycles ;
- dwell : 1 800 ms ;
- contraste élevé : activé ;
- mouvement réduit : respect de la préférence système ;
- démarrage du scan : manuel, pour éviter une activation surprise.

L'utilisateur peut modifier les valeurs dans Profil. Les réglages utilisent des variables CSS pour la taille des cibles et le contraste.
