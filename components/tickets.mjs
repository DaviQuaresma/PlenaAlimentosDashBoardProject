import fetch from 'node-fetch';

export default async function getTicketsNearDeadline(session_token) {
  const headers = {
    'Session-Token': session_token,
    'App-Token': process.env.APP_TOKEN,
    'Content-Type': 'application/json',
  };

  const calculateSLA = (ticket) => {
    const currentDate = new Date();
    const creationDate = new Date(ticket.date);
    const resolutionDate = new Date(ticket.time_to_resolve);

    const totalDuration = resolutionDate - creationDate;
    const elapsedDuration = currentDate - creationDate;

    let slaPercentage = (elapsedDuration / totalDuration) * 100;
    slaPercentage = Math.max(0, Math.min(slaPercentage, 100));

    return slaPercentage.toFixed(0);
  };

  // Função para obter os detalhes do usuário responsável
  const getUserDetails = async (userId) => {
    try {
      const response = await fetch(`${process.env.URL_PROD}/User/${userId}`, {
        method: 'GET',
        headers: headers,
      });

      if (response.ok) {
        const userDetails = await response.json();
        return userDetails.name; // Retorna apenas o nome do usuário
      } else {
        console.error('Erro ao obter os detalhes do usuário:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error.message);
    }

    return null;
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

      // Acesse o array de tickets no campo "data"
      let tickets = result.data;

      // Filtra os tickets para remover aqueles com a categoria "Outras Demandas"
      tickets = tickets.filter(ticket => ticket['7'] !== 'Outras Demandas');

      // Obtenha detalhes dos responsáveis
      const usersDetails = await Promise.all(
        tickets.map(ticket => getUserDetails(ticket['5']))
      );

      // Mapeia os tickets filtrados e adiciona a porcentagem de SLA
      return tickets.map((ticket, index) => ({
        id: ticket['2'],
        categorie: ticket['7'],
        responsable: usersDetails[index] || ticket['5'], // Substitua o ID pelo nome, se disponível
        SLA: calculateSLA({ // Função de calcular sla usando os campos date e time_to_resolve
          date: ticket['15'],
          time_to_resolve: ticket['151'],
        }) + '%'
      }));
    } else {
      console.error('Erro ao obter os tickets:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Erro ao fazer a requisição:', error.message);
  }
}