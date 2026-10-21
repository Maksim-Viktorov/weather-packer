// Grades OpenWeatherMap air pollution readings against the bands in its documentation:
// https://openweathermap.org/api/air-pollution

export const LEVEL_NAMES = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

// Upper limits (exclusive) of Good, Fair, Moderate and Poor, in µg/m³, so PM2.5 of exactly 10 is Fair.
// A value at or above the last limit is Very Poor.
// NH3 and NO are left out: the documentation gives them no bands and they do not affect the index.
export const BAND_LIMITS = {
    so2: [20, 80, 250, 350],
    no2: [40, 70, 150, 200],
    pm10: [20, 50, 100, 200],
    pm2_5: [10, 25, 50, 75],
    o3: [60, 100, 140, 180],
    co: [4400, 9400, 12400, 15400]
};

// What each pollutant is and does, summarised from the US EPA pages listed in the report
const POLLUTANTS = {
    so2: {
        name: 'SO2',
        healthRisk: 'Sulphur dioxide comes from burning fossil fuels. It harms the airways and makes breathing difficult, above all for children with asthma.'
    },
    no2: {
        name: 'NO2',
        healthRisk: 'Nitrogen dioxide comes mostly from traffic. It irritates the airways and can make asthma worse, above all in children and older adults.'
    },
    pm10: {
        name: 'PM10',
        healthRisk: 'Coarse particles such as dust and smoke can get deep into the lungs. People with heart or lung disease, children and older adults are most at risk.'
    },
    pm2_5: {
        name: 'PM2.5',
        healthRisk: 'Fine particles reach deep into the lungs and some enter the bloodstream. The EPA rates them as the pollutant with the greatest risk to health, above all for people with heart or lung disease, children and older adults.'
    },
    o3: {
        name: 'O3',
        healthRisk: 'Ground-level ozone forms when sunlight reacts with pollution. It can cause coughing, a sore throat and pain when breathing deeply, and can make asthma worse, above all for people active outdoors.'
    },
    co: {
        name: 'CO',
        healthRisk: 'Carbon monoxide is a colourless, odourless gas that reduces the oxygen reaching the heart. People with some heart conditions are most at risk, above all during exercise.'
    }
};

// What to do at each level, adapted from the European Air Quality Index health messages (EEA).
// Sensitive groups are people with asthma, heart or lung disease, children and older adults.
const LEVEL_ADVICE = [
    null,
    'Everyone, including sensitive groups, can enjoy their usual outdoor activities.',
    'Most people can carry on as usual. Sensitive groups should consider reducing intense outdoor activity if they notice symptoms.',
    'Consider reducing intense outdoor activity if you notice sore eyes, a cough or a sore throat. Sensitive groups should consider reducing physical activity, above all outdoors.',
    'Consider reducing intense outdoor activity if you notice sore eyes, a cough or a sore throat. Sensitive groups should reduce physical activity, above all outdoors.'
];

export function gradePollutant(code, value) {
    const limits = BAND_LIMITS[code];
    const bandIndex = limits.findIndex((limit) => value < limit);
    const levelIndex = bandIndex === -1 ? limits.length : bandIndex;
    const goodLimit = limits[0];

    return {
        code,
        name: POLLUTANTS[code].name,
        value,
        level: levelIndex + 1,   // 1 (Good) to 5 (Very Poor), the same scale as OpenWeatherMap's index
        levelName: LEVEL_NAMES[levelIndex],
        goodLimit,
        timesGoodLimit: Math.round(value / goodLimit * 10) / 10,
        healthRisk: levelIndex === 0 ? null : POLLUTANTS[code].healthRisk,
        advice: LEVEL_ADVICE[levelIndex]
    };
}

// Takes OpenWeatherMap's current air pollution response; null when it holds no reading
export function describeAirQuality(response) {
    const reading = response.list?.[0];
    if (!reading) {
        return null;
    }

    // A missing value would compare as "not below any limit" and be graded Very Poor, so skip it
    const codes = Object.keys(BAND_LIMITS).filter((code) => typeof reading.components[code] === 'number');

    return {
        overallIndex: reading.main.aqi,
        overallLevelName: LEVEL_NAMES[reading.main.aqi - 1],
        pollutants: codes.map((code) => gradePollutant(code, reading.components[code]))
    };
}
