/**
 * Planetary Hours Calculator — Pure JS, Chaldean Order
 * No external dependencies. Uses simplified sunrise/sunset formula.
 */

const CHALDEAN_ORDER = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
const DAY_RULERS = { 0: 'Sun', 1: 'Moon', 2: 'Mars', 3: 'Mercury', 4: 'Jupiter', 5: 'Venus', 6: 'Saturn' };

const PLANET_GLYPHS = {
  Saturn: '♄', Jupiter: '♃', Mars: '♂', Sun: '☉',
  Venus: '♀', Mercury: '☿', Moon: '☾'
};

const PLANET_COLORS = {
  Saturn: '#8a8a8a', Jupiter: '#c9a9c9', Mars: '#d66a6a', Sun: '#c9a96e',
  Venus: '#e8b4b8', Mercury: '#a9c9b9', Moon: '#a9b9c9'
};

const AUSPICIOUS_PLANETS = new Set(['Venus', 'Jupiter', 'Sun', 'Moon']);

/**
 * Simplified sunrise/sunset calculation.
 * Uses the NOAA algorithm approximation.
 */
function calcSunTimes(date, lat, lon) {
  const cacheKey = `sunTimes_${date.toDateString()}_${lat}_${lon}`;
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const zenith = 90.833;

  function calcTime(isRise) {
    const lngHour = lon / 15;
    const t = isRise
      ? dayOfYear + ((6 - lngHour) / 24)
      : dayOfYear + ((18 - lngHour) / 24);

    const M = (0.9856 * t) - 3.289;
    let L = M + (1.916 * Math.sin(M * Math.PI / 180)) + (0.020 * Math.sin(2 * M * Math.PI / 180)) + 282.634;
    L = ((L % 360) + 360) % 360;

    let RA = Math.atan(0.91764 * Math.tan(L * Math.PI / 180)) * 180 / Math.PI;
    RA = ((RA % 360) + 360) % 360;

    const Lquadrant = Math.floor(L / 90) * 90;
    const RAquadrant = Math.floor(RA / 90) * 90;
    RA = RA + (Lquadrant - RAquadrant);
    RA = RA / 15;

    const sinDec = 0.39782 * Math.sin(L * Math.PI / 180);
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH = (Math.cos(zenith * Math.PI / 180) - (sinDec * Math.sin(lat * Math.PI / 180)))
      / (cosDec * Math.cos(lat * Math.PI / 180));

    if (cosH > 1 || cosH < -1) return null; // no sunrise/sunset

    let H;
    if (isRise) {
      H = 360 - (Math.acos(cosH) * 180 / Math.PI);
    } else {
      H = Math.acos(cosH) * 180 / Math.PI;
    }
    H = H / 15;

    const T = H + RA - (0.06571 * t) - 6.622;
    let UT = ((T - lngHour) % 24 + 24) % 24;

    // Convert to local time
    const offset = -date.getTimezoneOffset() / 60;
    let localHour = (UT + offset) % 24;
    if (localHour < 0) localHour += 24;

    const hours = Math.floor(localHour);
    const minutes = Math.round((localHour - hours) * 60);

    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  const sunrise = calcTime(true);
  const sunset = calcTime(false);

  // Next day sunrise for night hours
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDayOfYear = dayOfYear + 1;

  // Simplified: use same calc for tomorrow sunrise
  const nextSunriseDate = new Date(tomorrow);
  const tCacheKey = `sunTimes_${tomorrow.toDateString()}_${lat}_${lon}`;
  let nextSunrise;

  // Quick recalc for next sunrise
  const lngHour = lon / 15;
  const tVal = tomorrowDayOfYear + ((6 - lngHour) / 24);
  const M = (0.9856 * tVal) - 3.289;
  let L = M + (1.916 * Math.sin(M * Math.PI / 180)) + (0.020 * Math.sin(2 * M * Math.PI / 180)) + 282.634;
  L = ((L % 360) + 360) % 360;
  let RA = Math.atan(0.91764 * Math.tan(L * Math.PI / 180)) * 180 / Math.PI;
  RA = ((RA % 360) + 360) % 360;
  const Lq = Math.floor(L / 90) * 90;
  const RAq = Math.floor(RA / 90) * 90;
  RA = RA + (Lq - RAq);
  RA = RA / 15;
  const sinDec = 0.39782 * Math.sin(L * Math.PI / 180);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(90.833 * Math.PI / 180) - (sinDec * Math.sin(lat * Math.PI / 180)))
    / (cosDec * Math.cos(lat * Math.PI / 180));
  const H = (360 - (Math.acos(cosH) * 180 / Math.PI)) / 15;
  const T = H + RA - (0.06571 * tVal) - 6.622;
  let UT = ((T - lngHour) % 24 + 24) % 24;
  const offset = -tomorrow.getTimezoneOffset() / 60;
  let localHour = (UT + offset) % 24;
  if (localHour < 0) localHour += 24;
  nextSunrise = new Date(tomorrow);
  nextSunrise.setHours(Math.floor(localHour), Math.round((localHour - Math.floor(localHour)) * 60), 0, 0);

  const result = {
    sunrise: sunrise?.getTime(),
    sunset: sunset?.getTime(),
    nextSunrise: nextSunrise?.getTime()
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(cacheKey, JSON.stringify(result));
  }

  return result;
}

/**
 * Calculate all 24 planetary hours for the current day/night cycle.
 */
export function getPlanetaryHours(lat = 43.6532, lon = -79.3832) {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const sunTimes = calcSunTimes(today, lat, lon);
  if (!sunTimes.sunrise || !sunTimes.sunset || !sunTimes.nextSunrise) return null;

  const sunrise = sunTimes.sunrise;
  const sunset = sunTimes.sunset;
  const nextSunrise = sunTimes.nextSunrise;

  const dayDuration = sunset - sunrise;
  const nightDuration = nextSunrise - sunset;
  const dayHourLength = dayDuration / 12;
  const nightHourLength = nightDuration / 12;

  // Day ruler determines starting planet
  const dayOfWeek = today.getDay();
  const dayRuler = DAY_RULERS[dayOfWeek];
  const startIdx = CHALDEAN_ORDER.indexOf(dayRuler);

  const hours = [];

  // 12 day hours
  for (let i = 0; i < 12; i++) {
    const planetIdx = (startIdx + i) % 7;
    const planet = CHALDEAN_ORDER[planetIdx];
    const start = new Date(sunrise + i * dayHourLength);
    const end = new Date(sunrise + (i + 1) * dayHourLength);
    hours.push({
      planet,
      glyph: PLANET_GLYPHS[planet],
      color: PLANET_COLORS[planet],
      start,
      end,
      isDay: true,
      isAuspicious: AUSPICIOUS_PLANETS.has(planet),
      hourNumber: i + 1
    });
  }

  // 12 night hours
  for (let i = 0; i < 12; i++) {
    const planetIdx = (startIdx + 12 + i) % 7;
    const planet = CHALDEAN_ORDER[planetIdx];
    const start = new Date(sunset + i * nightHourLength);
    const end = new Date(sunset + (i + 1) * nightHourLength);
    hours.push({
      planet,
      glyph: PLANET_GLYPHS[planet],
      color: PLANET_COLORS[planet],
      start,
      end,
      isDay: false,
      isAuspicious: AUSPICIOUS_PLANETS.has(planet),
      hourNumber: i + 1
    });
  }

  const nowMs = now.getTime();
  const currentIdx = hours.findIndex(h => nowMs >= h.start.getTime() && nowMs < h.end.getTime());

  return {
    hours,
    currentIdx,
    dayRuler,
    dayRulerGlyph: PLANET_GLYPHS[dayRuler],
    sunrise: new Date(sunrise),
    sunset: new Date(sunset)
  };
}

export function formatTime12h(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

export { PLANET_GLYPHS, PLANET_COLORS, AUSPICIOUS_PLANETS };
