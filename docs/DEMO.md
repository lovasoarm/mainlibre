# Déroulé de démonstration : 7 minutes

> À réaliser sur Chrome/Edge récent, depuis `localhost` ou HTTPS. Préparer une permission micro/webcam, mais conserver le plan B souris si le matériel ou le modèle est indisponible. Ne pas présenter comme observés les audits ou tests humains non réalisés.

| Temps     | Démonstration             | À dire / montrer                                                                                                                                                                                                                                             |
| --------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0:00–0:40 | Accueil et profil Alessia | Présenter le besoin, le preset appliqué et les cibles XL / contraste élevé / scanning lent.                                                                                                                                                                  |
| 0:40–1:30 | Scanning mono-bouton      | Activer le scan, utiliser une seule touche Espace pour avancer et sélectionner. Montrer pause et vitesse.                                                                                                                                                    |
| 1:30–2:20 | Clavier virtuel           | Ouvrir le clavier, observer la sélection lignes puis colonnes, écrire « bonjour ».                                                                                                                                                                           |
| 2:20–3:10 | Voix                      | Vérifier que le navigateur accepte la reconnaissance locale fr-FR, autoriser le micro, prononcer « ouvrir le clavier » puis une action simulée. Si le mode local manque, présenter le message de repli scanning ; ne pas activer de reconnaissance distante. |
| 3:10–4:30 | Menu RA                   | Ouvrir le menu caméra, calibrer la pose neutre, déplacer le curseur tête et maintenir la cible jusqu'au dwell. Montrer le plan B souris si besoin.                                                                                                           |
| 4:30–5:50 | Labo                      | Choisir une condition de simulation, effectuer une tâche, voir chronomètre, activations et journal. Rappeler qu'il faut des participants réels pour produire des résultats.                                                                                  |
| 5:50–6:30 | SUS et export             | Répondre aux 10 items de démonstration (sans présenter cela comme un résultat d'étude) et exporter les données locales.                                                                                                                                      |
| 6:30–7:00 | Audit et conclusion       | Montrer les deux grilles SNCF Connect / Doctolib avec statut « À VÉRIFIER PAR MOI » ; expliquer les limites, la confidentialité et les prochains essais.                                                                                                     |

## Plan B matériel

- **Micro absent/refusé/non supporté :** ne pas insister. Utiliser le scanning à une touche ; la page Voix indique l'état du support navigateur.
- **Webcam absente/refusée ou modèle manquant :** passer en mode souris dans le menu RA. Ce mode démontre le dwell et le comportement overlay, mais ne démontre pas le suivi de tête.
- **Réseau indisponible après installation :** les WASM et modèle MediaPipe sont locaux. Le mode voix dépend du service de reconnaissance du navigateur et peut ne pas fonctionner hors ligne ; utiliser le scanning.
- **Panne générale :** Fakes d'adapters en tests et démonstration du scanning clavier. Ne jamais prétendre que la caméra ou la voix ont fonctionné si elles n'ont pas été essayées.
