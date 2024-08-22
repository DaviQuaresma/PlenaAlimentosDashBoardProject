import initSession from './main.mjs';
import getUserDetails from './components/users.mjs';
import getTicketsNearDeadline from './components/tickets.mjs';
import calculateTicketTimes from './components/calculateTicketTimes.mjs';

export default async function app() {
    const session_token = await initSession();
    if (!session_token) {
        console.error('Não foi possível obter o session_token');
        return;
    }

    const tickets = await getTicketsNearDeadline(session_token);
    const ticketDataArray = [];

    if (tickets) {
            const filteredTickets = await Promise.all(tickets.map(async ticket => {
            const closedDate = ticket.closedate ? new Date(ticket.closedate.replace(/ /g, 'T') + 'Z') : null;
            const timeToResolve = ticket.time_to_resolve ? new Date(ticket.time_to_resolve.replace(/ /g, 'T') + 'Z') : null;
            const begin_waiting_date = ticket.begin_waiting_date ? new Date(ticket.begin_waiting_date.replace(/ /g, 'T') + 'Z') : null;

            const chamadoFechado = closedDate && !isNaN(closedDate.getTime());
            const chamadoPendente = begin_waiting_date && !isNaN(begin_waiting_date.getTime());

            // Verifica se timeToResolve é nulo ou se o ticket está pendente
            if (!timeToResolve || chamadoPendente) {
                return null;
            }

            const userLinkObj = ticket.links.find(link => link.rel === "User");
            let userDetails = null;
            if (userLinkObj) {
                userDetails = await getUserDetails(session_token, userLinkObj.href);
            }

            // Calcula os tempos usando o módulo separado
            const { tempoRestante, tempoRestanteEmPorcentagem, chamadoVencido, horasRestantes, minutosRestantes } = calculateTicketTimes(ticket, timeToResolve, chamadoFechado);

            const ticketInfo = {
                id: ticket.id,
                // status: ticket.status,
                user: userDetails ? userDetails.name : null,
                // fechado: chamadoFechado,
                // vencido: chamadoVencido,
                // pendente: chamadoPendente,
                tempoRestante: horasRestantes < 0 ?  `Chamado estourado` : `${horasRestantes} horas e ${minutosRestantes} minutos`,
                porcentagemRestante: tempoRestanteEmPorcentagem !== null ? `${Math.round(tempoRestanteEmPorcentagem)}%` : null,
            };

            ticketDataArray.push(ticketInfo);
            return ticketInfo;
        }));

        const jsonResponse = JSON.stringify(ticketDataArray.filter(ticket => ticket !== null), null, 2);
        return jsonResponse;
    }
}

app();
