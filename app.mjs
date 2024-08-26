import initSession from './main.mjs';
import getTicketsNearDeadline from './components/tickets.mjs';
// import getUserDetails from './components/users.mjs';
// import calculateTicketTimes from './components/calculateTicketTimes.mjs';

export default async function app() {
    const session_token = await initSession();
    if (!session_token) {
        console.error('Não foi possível obter o session_token');
        return;
    }

    const tickets = await getTicketsNearDeadline(session_token);
    let ticketDataArray = [];
    console.log(tickets)
    
    ticketDataArray.push(tickets);
    console.log(ticketDataArray)

    const jsonResponse = JSON.stringify(ticketDataArray.filter(ticket => ticket !== null), null, 2);
    return jsonResponse;

}

app();
