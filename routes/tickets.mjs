import fetch from 'node-fetch';

function getLastDayOfYear() {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), 11, 31); // Mês 11 é dezembro, e dia 31 é o último dia do ano
    return lastDay.toISOString().split('T')[0];
    }

    const lastDayOfYear = getLastDayOfYear(); 

export default async function getTicketsNearDeadline(session_token) {
  const apiBaseUrl = 'https://csti.cdmgrupo.com/glpi_homolog/apirest.php';
  const headers = {
      'Session-Token': session_token,
      'App-Token': process.env.APP_TOKEN,  // Utilizando a variável de ambiente
      'Content-Type': 'application/json',
  };

  try {
      const response = await fetch(`${apiBaseUrl}/Ticket?criteria[0][field]=due_date&criteria[0][searchtype]=lessthan&criteria[0][value]=${lastDayOfYear}`, {
          method: 'GET',
          headers: headers,
      });

      if (response.ok) {
          const tickets = await response.json();
          
          // Filtrar os campos necessários e retornar
          return tickets.map(ticket => ({
              id: ticket.id,
              date: ticket.date,
              closedate: ticket.closedate,
              solvedate: ticket.solvedate,
              status: ticket.status,
              time_to_resolve: ticket.time_to_resolve,
              time_to_own: ticket.time_to_own,
              begin_waiting_date: ticket.begin_waiting_date,
              sla_waiting_duration: ticket.sla_waiting_duration,
              links: ticket.links, // Adicionando links para acessar depois
          }));
      } else {
          console.error('Erro ao obter os tickets:', response.status, response.statusText);
      }
  } catch (error) {
      console.error('Erro ao fazer a requisição:', error.message);
  }
}