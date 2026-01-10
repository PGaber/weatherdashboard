// CALL LOCALSTORAGE
const missionsList = [];
let mission = "";

function loadMissionsFromLocalStorage() {
  const missionsListJson = localStorage.getItem("missions");
  if (missionsListJson) {
    const loadedMissions = JSON.parse(missionsListJson);
    missionsList.splice(0, missionsList.length, ...loadedMissions);
  }
}

loadMissionsFromLocalStorage();

// DATE CODE
const thirtyone = [1, 3, 5, 7, 8, 10, 12];
const thirty = [4, 6, 9, 11];
const feb = [2];

let leap = false;

let gmtHours = "";
let gmtDay = "";
let gmtDate = "";
let gmtMonth = "";
let gmtYear = "";
let dayName = "";
let gmtDayName = "";

function isLeapYear(year) {
  return (year % 400 === 0) || (year % 100 != 0 && year % 4 === 0);
}
/**
  * @param {Date} dtObject
  * @returns {{gpsWeek: number, gpsWeekReset: number, secondsOfWeek: number, gpsDateTimeUtc: Date}|null}
  */
function getGPSTime(dtObject) {
  const gpsEpochUTC = new Date();
  gpsEpochUTC.setUTCFullYear(1980, 0, 6)
  gpsEpochUTC.setUTCHours(0, 0, 0, 0)

  const currentUTCTime = new Date(dtObject.getTime());

  if (currentUTCTime < gpsEpochUTC) {
    console.error("Error: Input datetime is before the GPS epoch (Jan 6, 1980).");
    return null;
  }

  const timeDifferenceMs = currentUTCTime.getTime() - gpsEpochUTC.getTime();

  const totalSeconds = Math.floor(timeDifferenceMs / 1000)

  const SECONDS_PER_GPS_WEEK = 604800;

  const GPSWeekNumberRaw = Math.floor(totalSeconds / SECONDS_PER_GPS_WEEK);
  const secondsOfWeek = totalSeconds % SECONDS_PER_GPS_WEEK

  const GPS_WEEK_MODULO = 1024;
  const GPSWeekNumberEffective = GPSWeekNumberRaw % GPS_WEEK_MODULO;
  const GPSWeekResetCount = Math.floor(GPSWeekNumberRaw / GPS_WEEK_MODULO);

  return {
    gpsWeek: GPSWeekNumberEffective,
    secondsOfWeek: secondsOfWeek,
    gpsDateTimeUtc: currentUTCTime
  };
}

function updateClock() {
  const now = new Date();

  const nowUtc = new Date(now.getTime());

  const day = now.getDay();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  leap = isLeapYear(Number(year));

  if (Number(hours) - 7 >= 0) {
    gmtHours = String(Number(hours) - 7).padStart(2, '0');
    gmtDay = day;
    gmtDate = date;
    gmtMonth = month;
    gmtYear = year;
  } else {
    // change hour to yesterday's
    gmtHours = String(Number(hours) - 7 + 24).padStart(2, '0');
    // change day to yesterday's
    if (day === 0) {
      gmtDay = 6;
    } else {
      gmtDay = day - 1;
    }
    // change date, month, and year to yesterday's
    if (Number(date) === 1) {
      if (thirtyone.includes(Number(month) - 1)) {
        gmtDate = 31;
      } else if (thirty.includes(Number(month) - 1)) {
        gmtDate = 30;
      } else {
        if (leap) {
          gmtDate = 29;
        } else {
          gmtDate = 28;
        }
      }
      if (Number(month) === 1) {
        gmtMonth = 12;
        gmtYear = Number(year) - 1;
      } else {
        gmtMonth = String(Number(month) - 1).padStart(2, '0');
        gmtYear = year;
      }
    } else {
      gmtDate = date - 1;
      gmtMonth = month;
      gmtYear = year;
    }
    gmtDate = String(gmtDate).padStart(2, '0');
  }

  // convert days to its name
  const dayNameArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  dayName = dayNameArray[day];
  gmtDayName = dayNameArray[gmtDay];

  // print formated date and time to html
  document.querySelector(".js-gmt-time").innerHTML = 
    `${gmtDayName}, ${gmtYear}-${gmtMonth}-${gmtDate}, ${gmtHours}:${minutes}:${seconds}`;
  document.querySelector(".js-local-time").innerHTML =
    `${dayName}, ${year}-${month}-${date}, ${hours}:${minutes}:${seconds}`;

  const gpsComponents = getGPSTime(nowUtc);

  if (gpsComponents) {
    document.querySelector(".js-unix").innerHTML =
      `Week ${gpsComponents.gpsWeek + 2048} (${gpsComponents.gpsWeek}), SOW ${gpsComponents.secondsOfWeek}`;
  } else {
      document.querySelector(".js-unix").innerHTML = `GPS Time: Calculation Error`;
  }

  // คำนวณข้างขึ้นข้างแรม

  let dayOfYear = 0;

  if (Number(month) === 1) {
    dayOfYear += Number(date);
  } else if (Number(month) === 2) {
    dayOfYear += (31 + Number(date));
  } else if (Number(month) === 3) {
    dayOfYear += (59 + Number(date));
  } else if (Number(month) === 4) {
    dayOfYear += (90 + Number(date));
  } else if (Number(month) === 5) {
    dayOfYear += (120 + Number(date));
  } else if (Number(month) === 6) {
    dayOfYear += (151 + Number(date));
  } else if (Number(month) === 7) {
    dayOfYear += (181 + Number(date));
  } else if (Number(month) === 8) {
    dayOfYear += (212 + Number(date));
  } else if (Number(month) === 9) {
    dayOfYear += (243 + Number(date));
  } else if (Number(month) === 10) {
    dayOfYear += (273 + Number(date));
  } else if (Number(month) === 11) {
    dayOfYear += (304 + Number(date));
  } else if (Number(month) === 12) {
    dayOfYear += (334 + Number(date));
  }

  if (isLeapYear(Number(year)) && Number(month) >= 3) {
    dayOfYear ++;
  }

  // first waxing - 1 of the year
  const firstWax = -41;

  const phaseModulo = dayOfYear - firstWax;

  const phase = phaseModulo % 59

  let phaseType = "";
  let phaseDay = 0;

  let end = "";
  let moonEmoji = "";

  if (phase >= 1 && phase <= 15) {
    phaseType = "waxing";
    phaseDay += phase;
  } else if (phase >= 16 && phase <= 30) {
    phaseType = "waning";
    phaseDay += (phase - 15);
  } else if (phase >= 31 && phase <= 45) {
    phaseType = "waxing";
    phaseDay += (phase - 30);
  } else if (phase >= 46 && phase <= 59) {
    phaseType = "waning";
    phaseDay += (phase - 44);
  }

  if (phaseDay === 1) {
    end = "st";
  } else if (phaseDay === 2) {
    end = "nd";
  } else if (phaseDay === 3) {
    end = "rd";
  } else {
    end = "th";
  }

  if (phaseType === "waxing") {
    if (phaseDay >= 1 && phaseDay <= 6) {
      moonEmoji = "🌒";
    } else if (phaseDay >= 7 && phaseDay <= 10) {
      moonEmoji = "🌓";
    } else if (phaseDay >= 11 && phaseDay <= 14) {
      moonEmoji = "🌔";
    } else if (phaseDay === 15) {
      moonEmoji = "🌕";
    }
  } else if (phaseType === "waning") {
    if (phaseDay >= 1 && phaseDay <= 6) {
      moonEmoji = "🌖";
    } else if (phaseDay >= 7 && phaseDay <= 10) {
      moonEmoji = "🌗";
    } else if (phaseDay >= 11 && phaseDay <= 13) {
      moonEmoji = "🌘";
    } else if (phaseDay >= 14 && phaseDay <= 15) {
      moonEmoji = "🌑";
    }
  }

  document.querySelector(".js-moon-phase").innerHTML =
    `Moon Phase: ${phaseDay}${end} day of the ${phaseType} moon${moonEmoji}`;
}

setInterval(updateClock, 100);
updateClock();

// WEATHER CODE

function capitalizeFirstLetter(string) {
  if (string.length === 0) {
    return "";
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const apiKey = "c748e04a8910dc3cf3381f519de7b8b9";
const cityName = "Krabi";

function updateWeather() {
  let currentTemp;

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`)
    .then(response => {
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status} fetching current weather.`);
        return Promise.reject(new Error("Current weather fetch failed."));
      }
      return response.json();
    })
    .then(data => {
      let windDirection;
      if (data.wind.deg <= 22.5 || data.wind.deg > 337.5) {
        windDirection = "N";
      } else if (22.5 < data.wind.deg && data.wind.deg <= 67.5) {
        windDirection = "NE";
      } else if (67.5 < data.wind.deg && data.wind.deg <= 112.5) {
        windDirection = "E";
      } else if (112.5 < data.wind.deg && data.wind.deg <= 157.5) {
        windDirection = "SE";
      } else if (157.5 < data.wind.deg && data.wind.deg <= 202.5) {
        windDirection = "S";
      } else if (202.5 < data.wind.deg && data.wind.deg <= 247.5) {
        windDirection = "SW";
      } else if (247.5 < data.wind.deg && data.wind.deg <= 292.5) {
        windDirection = "W";
      } else if (292.5 < data.wind.deg && data.wind.deg <= 337.5) {
        windDirection = "NW";
      }

      let windSpeed = data.wind.speed * 3.6;

      let sunriseUnix = 1753139701;
      let sunsetUnix = 1753184774;

      let sunriseDate = new Date(sunriseUnix * 1000);
      let sunsetDate = new Date(sunsetUnix * 1000);

      const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Bangkok'
      };

      currentTemp = Math.round(data.main.temp);
      document.querySelector(".js-temperature").innerHTML = `${currentTemp}°`;
      document.querySelector(".js-weather-feels-like-temp").innerHTML = `Feels like ${Math.round(data.main.feels_like)}°`;
      document.querySelector(".js-description").innerHTML = capitalizeFirstLetter(data.weather[0].description);
      document.querySelector(".js-humidity").innerHTML = `Humidity: ${data.main.humidity}%`;
      document.querySelector(".js-wind").innerHTML = `Wind: ${windDirection}, ${(Math.round(windSpeed * 10)) / 10}km/h`;
      document.querySelector(".js-visibility").innerHTML = `Visibility: ${data.visibility / 1000} km`;
      document.querySelector(".js-sun").innerHTML = `Sunrise/Sunset: ${sunriseDate.toLocaleTimeString('en-US', timeOptions)}/${sunsetDate.toLocaleTimeString('en-US', timeOptions)}`;

      // weather image
      let weatherId = data.weather[0].id;
      let weatherGroup = Math.floor(weatherId / 100)

      let weatherSubGroup = Math.floor(weatherId / 10)

      // check day or night
      cycle = "";
      nowWeather = new Date();
      const hours = String(nowWeather.getHours());
      if (hours >= 6 && hours <= 18) {
        cycle = "day";
      } else {
        cycle = "night";
      }

      let imageId = 0;
      
      if (weatherGroup === 2) { // Thunderstorm
        imageId = "11d";
      } else if (weatherGroup === 3) { // Drizzle
        imageId = "09d";
      } else if (weatherGroup === 5) { // Rain
        if (weatherSubGroup === 50) { // Normal Rain
          imageId = "10d";
        } else if (weatherSubGroup === 51) { // Freezing Rain
          imageId = "13d";
        } else if (weatherSubGroup === 52 || weatherSubGroup === 53) { // Shower Rain
          imageId = "09d";
        }
      } else if (weatherGroup === 6) { // Snow
        imageId = "13d";
      } else if (weatherGroup === 7) { // Atmosphere
        imageId = "50d";
      } else if (weatherGroup === 8) {
        if (weatherId === 800) { // Clear
          if (cycle === "day") {
            imageId = "01d";
          } else if (cycle === "night") {
            imageId = "01n";
          }
        } else if (weatherId === 801) { // Few Clouds
          if (cycle === "day") {
            imageId = "02d";
          } else if (cycle === "night") {
            imageId = "02n";
          }
        } else if (weatherId === 802) { // Scattered Clouds
          imageId = "03d";
        } else { // Overcast Clouds
          imageId = "04d";
        }
      }

      document.querySelector(".js-weather-image").innerHTML =
        `<img src="${imageId}@2x.png">`;

      return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`);
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} fetching 24-hour forecast.`);
      }
      return response.json();
    })
    .then(data => {
      const forecastList = data.list;

      if (!forecastList || forecastList.length === 0) {
        console.error("No forecast data found for 24-hour calculation.");
        document.querySelector(".js-prec").textContent = `Precipitation: N/A`;
        return;
      }

      const now = Date.now();
      const twentyFourHoursLater = now + (24 * 60 * 60 * 1000);

      let tempsInNext24Hours = [];

      if (currentTemp !== undefined && currentTemp !== null) {
        tempsInNext24Hours.push(currentTemp);
      } else {
        console.warn("Current temperature not available for 24-hour calculation (using forecast data only).");
      }

      for (const item of forecastList) {
        const forecastTime = item.dt * 1000;

        if (forecastTime > now && forecastTime <= twentyFourHoursLater) {
          tempsInNext24Hours.push(item.main.temp);
        } else if (forecastTime > twentyFourHoursLater) {
          break;
        }
      }

      if (tempsInNext24Hours.length === 0) {
        console.error("No temperature data found for the next 24 hours in the forecast list.");
        return;
      }

      const high = Math.max(...tempsInNext24Hours);
      const low = Math.min(...tempsInNext24Hours);

      document.querySelector(".js-high").textContent = `H ${Math.round(high)}°`;
      document.querySelector(".js-low").textContent = `L ${Math.round(low)}°`;

      let recentPoP = 0;
      if (forecastList[0] && forecastList[0].pop !== undefined) {
        recentPoP = forecastList[0].pop;
      }

      document.querySelector(".js-prec").textContent = `Precipitation: ${recentPoP*100}%`;
    })
    .catch(error => {
      console.error("Error in weather update process:", error);
      document.querySelector(".js-high").textContent = `H N/A`;
      document.querySelector(".js-low").textContent = `L N/A`;
    });
}

setInterval(updateWeather, 10000 * 60);
updateWeather();

// MISSIONS CODE
renderMissionsList();

function addMission() {
  const missionInput = document.getElementById("js-mission-name").value;
  if (missionInput.trim().length > 0) {
    missionsList.push(missionInput);
    saveMissionsToLocalStorage();
    document.getElementById("js-mission-name").value = "";
    mission = "";
  }
  renderMissionsList();
}

function renderMissionsList() {
  if (missionsList.length === 0) {
    document.querySelector(".js-missions-list").innerHTML = `<div class="mission-todo">None. Conditions are stable.</div>`;
    document.querySelector(".js-mission-title").innerHTML = `🟢Missions left: 0`;
  } else {
    if (missionsList.length <= 3) {
      document.querySelector(".js-mission-title").innerHTML = `🟡Missions left: ${missionsList.length}`;
    } else {
      document.querySelector(".js-mission-title").innerHTML = `🔴Missions left: ${missionsList.length}`;
    }
    
    document.querySelector(".js-missions-list").innerHTML = ``;
    for (let i = 0; i < missionsList.length; i++) {
      document.querySelector(".js-missions-list").innerHTML +=
        `<div class="mission-todo">
          <p class="mission-todo-name">${missionsList[i]}</p>
          <div class="buttons">
            <button class="delete" onclick=removeMission(${i})>Delete</button>
            <button class="done" onclick=removeMission(${i})>Done!</button>
          </div>
        <div>`
    }
  }
}

function removeMission(index) {
  missionsList.splice(index, 1);
  saveMissionsToLocalStorage();
  renderMissionsList();
}

const missionInput = document.getElementById("js-mission-name");

if (missionInput) {
    missionInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            addMission();
        }
    });
}

function saveMissionsToLocalStorage() {
  const missionsListJson = JSON.stringify(missionsList);
  localStorage.setItem("missions", missionsListJson);
}