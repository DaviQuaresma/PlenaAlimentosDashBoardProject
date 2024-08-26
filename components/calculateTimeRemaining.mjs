export const calculateTimeRemaining = (time_to_resolve) => {
    const currentDate = new Date();
    const resolveDate = new Date(time_to_resolve);

    if (isNaN(resolveDate.getTime())) {
        console.error('Data de resolução inválida:', time_to_resolve);
        return 'Data inválida';
    }

    let diffMs = resolveDate - currentDate;

    if (diffMs < 0) {
        return "Chamado estourado";
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    const formattedDays = `${diffDays}d`;
    const formattedHours = `${String(diffHours).padStart(2, '0')}h`;
    const formattedMinutes = `${String(diffMinutes).padStart(2, '0')}m`;

    return `TEMPO RESTANTE: ${formattedDays} ${formattedHours} ${formattedMinutes}`;
};
