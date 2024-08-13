import fetch from 'node-fetch';

// Função para obter os detalhes do usuário responsável
export default async function getUserDetails(session_token, userLink) {
    const headers = {
        'Session-Token': session_token,
        'App-Token': process.env.APP_TOKEN,  // Utilizando a variável de ambiente
        'Content-Type': 'application/json',
    };

    try {
        const response = await fetch(userLink, {
            method: 'GET',
            headers: headers,
        });

        if (response.ok) {
            const userDetails = await response.json();
            return userDetails;
        } else {
            console.error('Erro ao obter os detalhes do usuário:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
    }
}