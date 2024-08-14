// import fetch from 'node-fetch';
import initSession from './main.mjs';
import getUserDetails from './routes/users.mjs';
import getTicketsNearDeadline from './routes/tickets.mjs';

export default async function main() {
    const session_token = await initSession();
    if (!session_token) {
        console.error('Não foi possível obter o session_token');
        return;
    }

    const tickets = await getTicketsNearDeadline(session_token);
    const ticketDataArray = []; // Array para armazenar os dados dos tickets

    if (tickets) {
            const filteredTickets = await Promise.all(tickets.map(async ticket => {
            const closedDate = ticket.closedate ? new Date(ticket.closedate.replace(/ /g, 'T') + 'Z') : null;
            const timeToResolve = new Date(ticket.time_to_resolve.replace(/ /g, 'T') + 'Z');
            const date = new Date(ticket.date.replace(/ /g, 'T') + 'Z');
            const begin_waiting_date = ticket.begin_waiting_date ? new Date(ticket.begin_waiting_date.replace(/ /g, 'T') + 'Z') : null;

            const chamadoFechado = closedDate && !isNaN(closedDate.getTime());
            const chamadoPendente = begin_waiting_date && !isNaN(begin_waiting_date.getTime());

            const tempoRestante = chamadoFechado ? null : timeToResolve - new Date();
            const tempoRestanteEmPorcentagem = tempoRestante ? Math.min(((new Date() - date) / (timeToResolve - date)) * 100, 100) : null;
            const chamadoVencido = tempoRestanteEmPorcentagem === 100;

            const userLinkObj = ticket.links.find(link => link.rel === "User");
            let userDetails = null;
            if (userLinkObj) {
                userDetails = await getUserDetails(session_token, userLinkObj.href);
            }

            const horasRestantes = tempoRestante ? Math.floor(tempoRestante / (1000 * 60 * 60)) : null;
            const minutosRestantes = tempoRestante ? Math.floor((tempoRestante % (1000 * 60 * 60)) / (1000 * 60)) : null;

            const ticketInfo = {
                id: ticket.id,
                status: ticket.status,
                user: userDetails ? userDetails.name : null,
                fechado: chamadoFechado,
                vencido: chamadoVencido,
                pendente: chamadoPendente,
                tempoRestante: tempoRestante !== null ? `${horasRestantes} horas e ${minutosRestantes} minutos` : null,
                porcentagemRestante: tempoRestanteEmPorcentagem !== null ? `${Math.round(tempoRestanteEmPorcentagem)}%` : null,
            };

            ticketDataArray.push(ticketInfo);

            return ticketInfo;
        }));

        const jsonResponse = JSON.stringify(ticketDataArray, null, 2);
        // console.log(jsonResponse);
        return jsonResponse;
    }
}

main();
