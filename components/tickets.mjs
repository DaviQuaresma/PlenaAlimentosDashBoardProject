import fetch from 'node-fetch';
import { calculateSLA } from './calculateSLA.mjs';
import { getUserDetails } from './getUserDetails.mjs';
import { calculateTimeRemaining } from './calculateTimeRemaining.mjs';
export default async function getTicketsNearDeadline(session_token) {
    const headers = {
        'Session-Token': session_token,
        'App-Token': process.env.APP_TOKEN,
        'Content-Type': 'application/json',
    };
    try {
        const response = await fetch(
            process.env.URL_PROD + `/search/Ticket?criteria[0][field]=17&criteria[0][searchtype]=contains&criteria[0][value]=null`,
            {
                method: 'GET',
                headers: headers,
            }
        );
        if (response.ok) {
            const result = await response.json();
            let tickets = result.data;
            tickets = tickets.filter(ticket => ticket['7'] !== 'Outras Demandas');
            const usersDetails = await Promise.all(
                tickets.map(ticket => getUserDetails(ticket['5'], headers))
            );
            const processedTickets = tickets.map((ticket, index) => ({
                id: ticket['2'],
                categorie: ticket['7'],
                responsable: usersDetails[index] || ticket['5'],
                time_to_resolve: calculateTimeRemaining(ticket['151']),
                SLA: calculateSLA({
                    date: ticket['15'],
                    time_to_resolve: ticket['151'],
                }) + '%'
            }));
            // Filtro para remover os tickets cujo SLA é 100%
            const filteredTickets = processedTickets.filter(ticket => parseFloat(ticket.SLA) < 100);
 
            // Ordena os tickets restantes
            filteredTickets.sort((a, b) => parseFloat(b.SLA) - parseFloat(a.SLA));
            return filteredTickets.slice(0, 20);
        } else {
            console.error('Erro ao obter os tickets:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
    }
}