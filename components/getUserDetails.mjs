import fetch from 'node-fetch';

export const getUserDetails = async (userId, headers) => {
    try {
        const response = await fetch(`${process.env.URL_PROD}/User/${userId}`, {
            method: 'GET',
            headers: headers,
        });

        if (response.ok) {
            const userDetails = await response.json();
            return userDetails.name;
        } else {
            console.error('Erro ao obter os detalhes do usuário:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
    }

    return null;
};
