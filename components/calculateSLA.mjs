export const calculateSLA = (ticket) => {
    const startTime = new Date(ticket.date);
    const endTime = new Date(ticket.time_to_resolve);
    const currentTime = new Date();

    const calculateWorkingHours = (startDate, endDate) => {
        let totalHours = 0;
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start.getHours() < 8) start.setHours(8, 0, 0, 0);
        if (start.getHours() >= 18) {
            start.setDate(start.getDate() + 1);
            start.setHours(8, 0, 0, 0);
        }
        if (end.getHours() < 8) end.setHours(8, 0, 0, 0);
        if (end.getHours() >= 18) end.setHours(18, 0, 0, 0);

        while (start < end) {
            if (start.getDay() > 0 && start.getDay() < 6) {
                const nextHour = new Date(start);
                nextHour.setHours(start.getHours() + 1);

                if (nextHour <= end) {
                    if (start.getHours() >= 8 && start.getHours() < 18) {
                        totalHours++;
                    }
                    start.setHours(start.getHours() + 1);
                } else {
                    break;
                }
            } else {
                start.setDate(start.getDate() + 1);
                start.setHours(8, 0, 0, 0);
            }
        }

        return totalHours;
    };

    const totalWorkingHours = calculateWorkingHours(startTime, endTime);
    const elapsedWorkingHours = calculateWorkingHours(startTime, currentTime);

    let slaPercentage = (elapsedWorkingHours / totalWorkingHours) * 100;
    slaPercentage = Math.max(0, Math.min(slaPercentage, 100));
    return slaPercentage.toFixed(0);
};
