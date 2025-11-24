const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve os arquivos do frontend

// "Banco de dados" temporário na memória (para um site real, use um DB)
let activeGame = null;

// Função para criar o campo minado
function createGame(minesCount) {
    const grid = Array(25).fill('diamond');
    // Espalha as minas aleatoriamente
    let placedMines = 0;
    while (placedMines < minesCount) {
        const randomIndex = Math.floor(Math.random() * 25);
        if (grid[randomIndex] !== 'mine') {
            grid[randomIndex] = 'mine';
            placedMines++;
        }
    }
    return {
        grid: grid, // O segredo fica aqui
        revealed: Array(25).fill(false),
        gameOver: false,
        multiplier: 1.0
    };
}

// Rota para começar o jogo
app.post('/api/start', (req, res) => {
    const { mines } = req.body;
    activeGame = createGame(mines || 3); // Padrão 3 minas
    res.json({ message: "Jogo iniciado!", multiplier: 1.0 });
});

// Rota para clicar em um quadrado
app.post('/api/play', (req, res) => {
    const { index } = req.body;

    if (!activeGame || activeGame.gameOver) {
        return res.status(400).json({ message: "Inicie um novo jogo." });
    }

    // Se era uma mina
    if (activeGame.grid[index] === 'mine') {
        activeGame.gameOver = true;
        return res.json({ 
            status: "boom", 
            grid: activeGame.grid // Revela tudo agora que perdeu
        });
    }

    // Se era diamante
    activeGame.revealed[index] = true;
    activeGame.multiplier += 0.2; // Lógica simples de multiplicador
    
    res.json({ 
        status: "safe", 
        multiplier: activeGame.multiplier.toFixed(2) 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
