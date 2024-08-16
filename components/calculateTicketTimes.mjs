export default function calculateTicketTimes(ticket, timeToResolve, chamadoFechado) {
    let date = new Date(ticket.date.replace(/ /g, 'T') + 'Z');

    let tempoRestante;
    if (chamadoFechado) {
        tempoRestante = null;
    } else {
        tempoRestante = timeToResolve - new Date();
    }

    let tempoRestanteEmPorcentagem;
    if (tempoRestante) {
        tempoRestanteEmPorcentagem = Math.min(((new Date() - date) / (timeToResolve - date)) * 100, 100);
    } else {
        tempoRestanteEmPorcentagem = null;
    }

    let chamadoVencido;
    if (tempoRestanteEmPorcentagem === 100) {
        chamadoVencido = true;
    } else {
        chamadoVencido = false;
    }

    let horasRestantes;
    if (tempoRestante) {
        horasRestantes = Math.floor(tempoRestante / (1000 * 60 * 60));
    } else {
        horasRestantes = null;
    }

    let minutosRestantes;
    if (tempoRestante) {
        minutosRestantes = Math.floor((tempoRestante % (1000 * 60 * 60)) / (1000 * 60));
    } else {
        minutosRestantes = null;
    }

    return { tempoRestante, tempoRestanteEmPorcentagem, chamadoVencido, horasRestantes, minutosRestantes };
}
