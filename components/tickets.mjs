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

            // Processar tickets e calcular SLA
            const processedTickets = tickets.map((ticket, index) => {
                const SLA = calculateSLA({
                    date: ticket['15'],
                    time_to_resolve: ticket['151'],
                });

                return {
                    id: ticket['2'],
                    categorie: ticket['1'],
                    responsable: usersDetails[index] || ticket['5'],
                    time_to_resolve: calculateTimeRemaining(ticket['151']),
                    SLA: SLA, // Retorna a porcentagem numérica do SLA
                };
            });

            // Filtrar os tickets cujo SLA é menor que 100
            const filteredTickets = processedTickets.filter(ticket => ticket.SLA < 100);
																
         ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // PARA RETORNAR TODOS OS CHAMADOS SEM FILTRO DE 10 MAIS PROXIMOS A ESTOURAR
        
        // Mapeia os tickets filtrados e adiciona a porcentagem de SLA
        // return tickets.map((ticket, index) => ({
        //   id: ticket['2'],
        //   categorie: ticket['7'],
        //   responsable: usersDetails[index] || ticket['5'], // Substitua o ID pelo nome, se disponível
        //   time_to_resolve: calculateTimeRemaining(ticket['151']), // Calcula o tempo restante no formato hh:mm
        //   SLA: calculateSLA({ // Função de calcular sla usando os campos date e time_to_resolve
        //     date: ticket['15'],
        //     time_to_resolve: ticket['151'],
        //   }) + '%'
        // }));

            // Ordenar os tickets por SLA (opcional, se quiser retornar os mais próximos de estourar)
            filteredTickets.sort((a, b) => parseFloat(b.SLA) - parseFloat(a.SLA));

            // Retornar os 20 tickets mais próximos de estourar
            return filteredTickets.slice(0, 20);

       // EM CASO DE QUERER TRAZER TODOS BASTA COMENTAR TODO ESSE TRECHO E DESCOMENTAR O TRECHO DE CIMA
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        } else {
            console.error('Erro ao obter os tickets:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
    }
}