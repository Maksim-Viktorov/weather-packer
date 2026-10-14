function toLocalIso(unixSeconds, offsetSeconds) {
    return new Date((unixSeconds + offsetSeconds) * 1000).toISOString();
}

export function toLocalDate(unixSeconds, offsetSeconds) {
    return toLocalIso(unixSeconds, offsetSeconds).slice(0, 10);
}

export function toLocalTime(unixSeconds, offsetSeconds) {
    return toLocalIso(unixSeconds, offsetSeconds).slice(11, 16);
}

export function toSlot(entry, offsetSeconds) {
    const time = toLocalTime(entry.dt, offsetSeconds);
    const isDaytime = entry.sys?.pod === 'd';

    return {
        dt: entry.dt,
        time,
        temp: entry.main.temp,
        feelsLike: entry.main.feels_like,
        windSpeed: entry.wind.speed,
        rainMm: entry.rain?.['3h'] ?? 0,
        description: entry.weather[0].description,
        icon: entry.weather[0].icon,
        isDaytime
    };
}

export function selectNextThreeDays(forecast, now = Date.now()) {
    const offsetSeconds = forecast.city.timezone;
    const todayDate = toLocalDate(Math.floor(now / 1000), offsetSeconds);
    
    const groupsMap = new Map();

    for (const entry of forecast.list) {
        const date = toLocalDate(entry.dt, offsetSeconds);

        if (date <= todayDate) continue;

        if (!groupsMap.has(date) && groupsMap.size >= 3) break;

        if (!groupsMap.has(date)) {
            groupsMap.set(date, []);
        }

        groupsMap.get(date).push(toSlot(entry, offsetSeconds));
    }

    return Array.from(groupsMap, ([date, slots]) => ({ date, slots }));
}