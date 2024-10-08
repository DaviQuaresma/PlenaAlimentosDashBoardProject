import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const USER = process.env.USER;
const APP_TOKEN = process.env.APP_TOKEN;

export default async function initSession() {
    try {                               
        const response = await fetch(process.env.URL_PROD+'/initSession?get_full_session=true', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `user_token ${USER}`,
                'App-Token': APP_TOKEN
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.session_token;
        } else {
            console.error('Erro ao iniciar a sessão:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
    }
}
