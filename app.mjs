import fetch from 'node-fetch';
import initSession from './main.mjs';
import getUserDetails from './routes/users.mjs'
import getTicketsNearDeadline from './routes/tickets.mjs'

// Função principal
async function main() {
    const session_token = await initSession();
    if (!session_token) {
        console.error('Não foi possível obter o session_token');
        return;
    }

    const tickets = await getTicketsNearDeadline(session_token);

    if (tickets) {
        // Aplicar condicionais ou manipular os dados dos tickets
        const filteredTickets = await Promise.all(tickets.map(async ticket => {
            const closedDate = ticket.closedate ? new Date(ticket.closedate.replace(/ /g, 'T') + 'Z') : null;
            const timeToResolve = new Date(ticket.time_to_resolve.replace(/ /g, 'T') + 'Z');
            const date = new Date(ticket.date.replace(/ /g, 'T') + 'Z');
            const begin_waiting_date = ticket.begin_waiting_date ? new Date(ticket.begin_waiting_date.replace(/ /g, 'T') + 'Z') : null;

            // Verificar se a data de fechamento é válida
            const chamadoFechado = closedDate && !isNaN(closedDate.getTime());

            // Verificar se o ticket está pendente
            const chamadoPendente = begin_waiting_date && !isNaN(begin_waiting_date.getTime());

            // Calcular o tempo restante em milissegundos
            const tempoRestante = chamadoFechado ? null : timeToResolve - new Date();
            
            // Calcular o tempo restante em porcentagem, limitando a 100%
            const tempoRestanteEmPorcentagem = tempoRestante
                ? Math.min(((new Date() - date) / (timeToResolve - date)) * 100, 100)
                : null;

            // Verificar se o ticket está vencido
            const chamadoVencido = tempoRestanteEmPorcentagem === 100;

            // Obter os detalhes do usuário responsável
            const userLinkObj = ticket.links.find(link => link.rel === "User");
            let userDetails = null;
            if (userLinkObj) {
                userDetails = await getUserDetails(session_token, userLinkObj.href);
            }

            return {
                id: ticket.id,
                date: ticket.date,
                closedate: ticket.closedate,
                solvedate: ticket.solvedate,
                status: ticket.status,
                time_to_resolve: ticket.time_to_resolve,
                time_to_own: ticket.time_to_own,
                begin_waiting_date: ticket.begin_waiting_date,
                sla_waiting_duration: ticket.sla_waiting_duration,
                chamadoFechado,
                chamadoVencido,
                chamadoPendente,
                tempoRestante,
                tempoRestanteEmPorcentagem,
                userDetails,
            };
        }));

        //STATUS = 1 -> NOVO
        //STATUS = 2 -> EM ATENDIMENTO
        //STATUS = 3 -> ATENDIMENTO PLANEJADO
        //STATUS = 4 -> PENDENTE 
        //STATUS = 5 -> SOLUCIONADO
        //STATUS = 6 -> FECHADO

        // Exibir tickets filtrados com base nas condições
        filteredTickets.forEach(ticket => {
            if (ticket.chamadoFechado && ticket.userDetails) {
                console.log(`
                    Ticket ${ticket.id} está fechado.
                    Responsável pelo ticket: ${ticket.userDetails.name}
                    Status do chamado: ${ticket.status}
                    `);

            } else if (ticket.chamadoVencido && ticket.userDetails) {
                console.log(`
                    Ticket ${ticket.id} está vencido.
                    Responsável pelo ticket: ${ticket.userDetails.name}
                    Status do chamado: ${ticket.status}
                    `);


            } else if (ticket.chamadoPendente && ticket.userDetails) {
                console.log(`
                    Ticket ${ticket.id} está pendente.
                    Responsável pelo ticket: ${ticket.userDetails.name}
                    Status do chamado: ${ticket.status}
                    `);


            } else if (ticket.tempoRestante !== null) {
                const horasRestantes = Math.floor(ticket.tempoRestante / (1000 * 60 * 60));
                const minutosRestantes = Math.floor((ticket.tempoRestante % (1000 * 60 * 60)) / (1000 * 60));
                
                console.log(`
                    Responsável pelo ticket ${ticket.id}: ${ticket.userDetails.name}
                    Tempo restante: ${horasRestantes} horas e ${minutosRestantes} minutos
                    Porcentagem:  ${Math.round(ticket.tempoRestanteEmPorcentagem)}%
                    Status do chamado: ${ticket.status}
                    `);
            }
            // // Exibindo detalhes do usuário, se disponíveis
            // if (ticket.userDetails) {
            //     console.log(`Responsável pelo ticket ${ticket.id}: ${ticket.userDetails.name}`);
            // }
        });
    }
}

main();
