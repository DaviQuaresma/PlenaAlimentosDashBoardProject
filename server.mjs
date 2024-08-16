import express from 'express';
import main from './app.mjs';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/view1', async (req, res) => {
    try {
        const jsonResponse = await main();
        res.json(JSON.parse(jsonResponse)); // Enviar o JSON como resposta bem formatada
    } catch (error) {
        console.error('Erro ao processar o JSON:', error);
        res.status(500).send('Erro ao processar o JSON');
    }
});

app.listen(port, () => {
    console.log(`Listening on port: http://localhost:${port}`);
});