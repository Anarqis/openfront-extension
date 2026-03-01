const WebSocket = require('ws');
const http = require('http');

// Render assigne dynamiquement un port via process.env.PORT
const PORT = process.env.PORT || 3000;

// Création d'un serveur HTTP très basique (nécessaire pour Render)
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Le serveur de ping pour OpenFront est en ligne !');
});

// Initialisation du serveur WebSocket par-dessus le serveur HTTP
const wss = new WebSocket.Server({ server });

// Quand un joueur (le script Tampermonkey) se connecte au serveur
wss.on('connection', (ws) => {
    console.log('Un joueur a rejoint le canal de ping.');

    // Quand le serveur reçoit un message (un ping) d'un joueur
    ws.on('message', (message) => {
        // Le message contiendra les coordonnées X et Y de la carte
        console.log(`Nouveau ping reçu : ${message}`);

        // Phase de BROADCAST : on redistribue ce ping à TOUS les autres joueurs
        wss.clients.forEach((client) => {
            // On vérifie que la connexion du client est ouverte 
            // ET on évite de renvoyer le ping à celui qui vient de le créer
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    // Quand un joueur ferme son onglet ou quitte le jeu
    ws.on('close', () => {
        console.log('Un joueur a quitté le canal.');
    });
});

// Lancement du serveur sur le bon port
server.listen(PORT, () => {
    console.log(`Serveur démarré avec succès sur le port ${PORT}`);
});