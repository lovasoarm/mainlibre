# 01 : Audit d'accessibilité : mobilité réduite

> **Nature de cet audit : analyse documentaire des informations publiques officielles, complétée par une grille de vérification manuelle.** Consultation documentaire effectuée le 14 novembre 2026. Aucun parcours interactif complet n'a été exécuté avec un clavier, un contacteur, un lecteur d'écran ou une personne concernée. Les faits documentés ci-dessous sont distingués des points qui restent **À VÉRIFIER PAR MOI**.

## Méthode et échelle

- Public cible de l'analyse : personne utilisant un clavier ou un contacteur unique, avec endurance limitée, gestes fins difficiles ou vitesse de sélection réduite.
- 0 : aucun obstacle observé sur le parcours testé ; 1 : gêne mineure ; 2 : obstacle important ; 3 : blocage. **Aucune note chiffrée n'est attribuée avant l'essai manuel.**
- Une déclaration d'accessibilité ou un article d'aide décrit le périmètre de son auteur ; il ne prouve pas le comportement de toutes les pages ni de toutes les versions.
- Référentiel de vérification motrice : WCAG 2.2, notamment 2.1.1 (clavier), 2.1.2 (pas de piège clavier), 2.2.1 (réglage du temps), 2.4.7 et 2.4.11 (focus visible / non masqué), 2.5.1 (gestes), 2.5.2 (annulation du pointeur), 2.5.7 (mouvements de glissement), 2.5.8 (taille des cibles), 3.2.1 (au focus) et 3.2.2 (à la saisie).

## Grille commune à compléter pendant l'essai pratique

| Critère WCAG 2.2             | Vérification à réaliser                                                                            | Gravité après essai | Constat terrain        |
| ---------------------------- | -------------------------------------------------------------------------------------------------- | ------------------: | ---------------------- |
| 2.1.1 Clavier                | Parcourir le scénario complet avec Tab, Maj+Tab, Entrée et Espace                                  |             À coter | **À VÉRIFIER PAR MOI** |
| 2.1.2 Pas de piège clavier   | Entrer puis sortir de chaque widget, dialogue et calendrier                                        |             À coter | **À VÉRIFIER PAR MOI** |
| 2.4.7 / 2.4.11 Focus         | Contrôler visibilité et non-masquage du focus sur chaque contrôle                                  |             À coter | **À VÉRIFIER PAR MOI** |
| 2.5.1 Gestes pointeur        | Vérifier qu'une action n'exige pas un geste multipoint ou une trajectoire complexe                 |             À coter | **À VÉRIFIER PAR MOI** |
| 2.5.2 Annulation du pointeur | Vérifier activation au relâchement, annulation et possibilité de déplacer le pointeur avant action |             À coter | **À VÉRIFIER PAR MOI** |
| 2.5.7 Glissement             | Vérifier qu'aucune action essentielle ne dépend uniquement du glisser-déposer                      |             À coter | **À VÉRIFIER PAR MOI** |
| 2.5.8 Taille des cibles      | Mesurer les cibles et leur espacement ; tester une activation par contacteur                       |             À coter | **À VÉRIFIER PAR MOI** |
| 2.2.1 Temps                  | Identifier les délais, expirations et possibilités d'extension                                     |             À coter | **À VÉRIFIER PAR MOI** |
| 3.2.1 / 3.2.2 Contexte       | Vérifier qu'un focus ou une saisie ne provoque pas une navigation inattendue                       |             À coter | **À VÉRIFIER PAR MOI** |

## Interface 1 : SNCF Connect

- Site : [sncf-connect.com](https://www.sncf-connect.com/)
- Déclaration officielle : [Déclaration d'accessibilité SNCF Connect](https://www.sncf-connect.com/accessibilite)
- Parcours choisi : rechercher un trajet, choisir une date, comparer des résultats et parcourir le début de réservation sans paiement.

### Faits documentés dans la déclaration officielle

La déclaration consultée indique que le site était en conformité **partielle** avec le RGAA 4.1.2. Elle rapporte un audit réalisé en août 2025, mis à jour en octobre 2025, avec 84,42 % de critères respectés sur les pages auditées (moyenne indiquée : 96,00 %). Ces taux portent sur le périmètre RGAA audité par SNCF ; ils ne constituent pas un score propre à la motricité ni un audit indépendant de MainLibre.

Les non-conformités publiées ayant un lien direct avec l'accès moteur ou le contrôle clavier comprennent :

- Sur plusieurs pages, le bouton qui vide un champ ne replace pas le focus dans le champ. **Conséquence possible :** un utilisateur clavier/contacteur peut perdre sa position et devoir retrouver le champ.
- Certaines boîtes de dialogue ne sont pas annoncées par certains lecteurs d'écran, n'ont pas de titre ou ne restituent leur contenu qu'après tabulation. **Conséquence possible :** le contexte d'une interaction devient moins prévisible.
- Après l'apparition ou la disparition de contenu, le focus n'est pas toujours repositionné correctement.
- Sur certaines pages d'aide, des éléments peuvent être inaccessibles au clavier selon la taille d'écran.
- Sur le Chat Bot et la création de compte, la prise de focus n'est pas visible sur quelques éléments.
- Entre les résultats aller/retour et le paiement, la déclaration signale une limite de temps liée à la mise à disposition des billets, sans solution satisfaisante identifiée à la date de la déclaration.
- Dans le dialogue « Choisissez un tarif », les onglets de classe sont annoncés comme boutons radio et ne se changent pas avec les flèches.

### Analyse ciblée mobilité réduite

| Zone du parcours                    | Constat documentaire                                                                                          |                   Gravité documentaire | Amélioration à privilégier                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------: | ---------------------------------------------------------------------------------------------------------------------- |
| Formulaire départ / arrivée         | Défauts signalés sur le retour du focus après vidage de champ et l'annonce de certains résultats de recherche | 2 : à confirmer sur le parcours choisi | Rendre le focus au champ, annoncer les résultats et permettre le choix sans précision de pointeur                      |
| Dialogues et filtres                | Défauts annoncés de titre, d'annonce et de repositionnement du focus                                          |                        2 : à confirmer | Titre programmatique, focus initial contrôlé, fermeture clavier, restitution du focus à l'élément déclencheur          |
| Choix de tarif / classe             | Les flèches ne modifient pas la sélection du contrôle annoncé comme groupe radio                              |       2 : documenté par la déclaration | Implémenter le modèle clavier cohérent du groupe de choix et tester Espace/flèches                                     |
| Résultats → paiement                | Limite de temps déclarée                                                                                      |     2 : documenté, périmètre à rejouer | Expliquer la durée, permettre l'extension lorsque possible et offrir une reprise sans perte lorsque le billet l'impose |
| Aide, chatbot et création de compte | Inaccessibilité clavier à certains formats et focus non visible sur quelques éléments                         |          2 : documenté, pages précises | Contrôle avec clavier seul, focus fortement visible et ordre de tabulation stable                                      |

**À VÉRIFIER PAR MOI :** la taille physique des boutons et des dates, les espaces entre les cibles, l'ordre de tabulation sur le formulaire de recherche actuel, l'annulation d'une activation au pointeur et le comportement exact sur Chrome/Edge. La déclaration consultée ne permet pas de conclure sur ces mesures.

## Interface 2 : Doctolib

- Site : [doctolib.fr](https://www.doctolib.fr/)
- Sources officielles consultées : [Accessibilité Doctolib](https://about.doctolib.com/accessibility/) et [aide patient : recherche d'un soignant](https://doctolibpatient.zendesk.com/hc/fr/articles/360025315234-Je-souhaite-prendre-un-rendez-vous-comment-chercher-un-soignant-sur-Doctolib).
- Parcours choisi : rechercher une spécialité et une ville, parcourir les résultats, ouvrir un profil et examiner les disponibilités sans confirmer le rendez-vous.

### Faits documentés dans les sources officielles

- Doctolib déclare travailler à l'accessibilité de son service de réservation selon EN 301 549 et indique collaborer avec des personnes en situation de handicap pour recueillir leurs besoins.
- Son centre d'aide décrit un parcours web avec recherche par nom ou spécialité, saisie d'une localisation, filtres de disponibilité, affichage des résultats et ouverture d'un profil.
- L'aide patient indique que les profils de praticiens peuvent présenter des informations d'accessibilité physique du cabinet lorsqu'elles ont été renseignées : stationnement PMR, accès sans marche ou rampe, ascenseur et portes automatiques.

Ces informations sont positives pour l'autonomie de préparation d'une consultation, mais elles ne démontrent pas à elles seules que le formulaire et le calendrier sont utilisables au clavier ou avec un contacteur. Les sources officielles consultées ne fournissent pas de résultat d'audit clavier détaillé comparable à la déclaration SNCF Connect.

### Analyse ciblée mobilité réduite

| Zone du parcours                    | Constat documentaire                                                                                                       |                Gravité documentaire | Amélioration / point de contrôle                                                                                  |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------: | ----------------------------------------------------------------------------------------------------------------- |
| Recherche spécialité / localisation | Plusieurs champs et une action de recherche sont décrits ; leur ordre de focus n'est pas documenté par la source consultée |                           Non cotée | Tester les labels, le focus, les suggestions et l'accès avec une touche unique                                    |
| Filtres de disponibilité            | L'aide décrit l'ouverture d'une interface de filtres et la sélection de plusieurs valeurs                                  |                           Non cotée | Vérifier entrée/sortie clavier, fermeture, restitution du focus et taille des cibles                              |
| Résultats et profils                | Les résultats conduisent à la fiche d'un soignant puis à l'action « Prendre rendez-vous »                                  |                           Non cotée | Vérifier que les cartes et actions sont activables sans précision de pointeur et que le focus reste prévisible    |
| Calendrier et créneaux              | Les sources consultées ne décrivent pas précisément la navigation clavier dans le calendrier du site                       |                           Non cotée | Vérifier commandes jour précédent/suivant, focus du créneau, alternatives aux gestes précis                       |
| Accessibilité du cabinet            | Les informations sont affichées si elles ont été renseignées par le cabinet                                                | 1 : limite d'information documentée | Signaler clairement l'information inconnue et permettre de filtrer les besoins d'accès lorsqu'ils sont renseignés |

**À VÉRIFIER PAR MOI :** la navigation complète au clavier, le comportement du calendrier, la taille et l'espacement des créneaux, la durée des étapes, les messages d'erreur, le focus après filtrage et la possibilité de reprendre un parcours interrompu. Aucun défaut de ces éléments n'est affirmé sans essai réel.

## Synthèse provisoire

| Interface    | Conclusion supportée par les sources                                                                                                                                            | Ce qui reste indispensable                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| SNCF Connect | Une déclaration officielle documente plusieurs défauts pertinents pour l'usage au clavier, le focus, les dialogues et les limites de temps                                      | Rejouer le parcours actuel et mesurer tailles, focus, contacteur et annulation                      |
| Doctolib     | Les sources décrivent un parcours de réservation et des informations d'accessibilité physique ; elles ne suffisent pas à conclure sur l'accessibilité motrice des contrôles web | Effectuer un audit pratique du formulaire, des filtres, du calendrier et du parcours de réservation |

## Sources consultées

1. SNCF Connect, « Déclaration d'accessibilité du site et des applications mobiles », état de conformité du site au 28 novembre 2025 et audit d'août/octobre 2025 : https://www.sncf-connect.com/accessibilite (consultée le 14 novembre 2026).
2. Doctolib, « Accessibility » : https://about.doctolib.com/accessibility/ (consultée le 14 novembre 2026).
3. Doctolib, « Je souhaite prendre un rendez-vous, comment chercher un soignant sur Doctolib ? », mise à jour du 3 novembre 2026 : https://doctolibpatient.zendesk.com/hc/fr/articles/360025315234-Je-souhaite-prendre-un-rendez-vous-comment-chercher-un-soignant-sur-Doctolib (consultée le 14 novembre 2026).
4. Doctolib, « Consulter les informations d'accessibilité d'un cabinet sur le profil d'un soignant », mise à jour du 6 juillet 2026 : https://doctolibpatient.zendesk.com/hc/fr/articles/28714801992860-Consulter-les-informations-d-accessibilit%C3%A9-d-un-cabinet-sur-le-profil-d-un-soignant (consultée le 14 novembre 2026).

Ne pas présenter les recommandations conditionnelles comme des défauts établis. Conserver des notes de parcours et captures anonymisées si elles sont autorisées, sans donnée personnelle.
