/**
 * Weather Pro - Modern Weather Application
 * A portfolio-quality weather app using OpenWeather API
 * Features: Current weather, hourly forecast, 5-day forecast, dynamic themes
 */

// ========================================
// Configuration & Constants
// ========================================
const apiKey = "e0a60ea474767c2b20eebde461aed9ca";
const API_BASE = "https://api.openweathermap.org/data/2.5";
const GEO_API = "https://api.openweathermap.org/geo/1.0";

// App State
let state = {
  unit: "metric", // metric (Celsius) or imperial (Fahrenheit)
  currentCity: "",
  isDarkMode: false,
  weatherData: null,
  forecastData: null
};

// DOM Elements Cache
const elements = {
  body: document.getElementById("appBody"),
  cityInput: document.getElementById("cityInput"),
  searchBtn: document.getElementById("searchBtn"),
  suggestions: document.getElementById("suggestions"),
  loadingState: document.getElementById("loadingState"),
  errorState: document.getElementById("errorState"),
  weatherContent: document.getElementById("weatherContent"),
  errorMsg: document.getElementById("errorMsg"),
  retryBtn: document.getElementById("retryBtn"),
  unitToggle: document.getElementById("unitToggle"),
  unitDisplay: document.getElementById("unitDisplay"),
  darkModeToggle: document.getElementById("darkModeToggle"),
  // Weather display elements
  cityName: document.getElementById("cityName"),
  dateTime: document.getElementById("dateTime"),
  weatherIcon: document.getElementById("weatherIcon"),
  temperature: document.getElementById("temperature"),
  feelsLike: document.getElementById("feelsLike"),
  description: document.getElementById("description"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),
  pressure: document.getElementById("pressure"),
  visibility: document.getElementById("visibility"),
  sunrise: document.getElementById("sunrise"),
  sunset: document.getElementById("sunset"),
  sunPosition: document.getElementById("sunPosition"),
  hourlyForecast: document.getElementById("hourlyForecast"),
  forecast: document.getElementById("forecast")
};

// ========================================
// Weather Theme Mapping
// ========================================
const weatherThemes = {
  "01d": "weather-clear",    // clear sky day
  "01n": "weather-night",    // clear sky night
  "02d": "weather-clear",    // few clouds day
  "02n": "weather-night",    // few clouds night
  "03d": "weather-cloudy",   // scattered clouds
  "03n": "weather-cloudy",
  "04d": "weather-cloudy",   // broken clouds
  "04n": "weather-cloudy",
  "09d": "weather-rain",     // shower rain
  "09n": "weather-rain",
  "10d": "weather-rain",     // rain
  "10n": "weather-rain",
  "11d": "weather-thunder",  // thunderstorm
  "11n": "weather-thunder",
  "13d": "weather-snow",     // snow
  "13n": "weather-snow",
  "50d": "weather-cloudy",   // mist
  "50n": "weather-cloudy"
};

// ========================================
// Utility Functions
// ========================================

/**
 * Format time from Unix timestamp
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Formatted time string (e.g., "6:30 AM")
 */
function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

/**
 * Format date from Unix timestamp or Date object
 * @param {number|Date} date - Unix timestamp or Date object
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const d = typeof date === "number" ? new Date(date * 1000) : date;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
}

/**
 * Get day name from date string
 * @param {string} dateStr - Date string (e.g., "2024-01-15 12:00:00")
 * @returns {object} Object with day name and formatted date
 */
function getDayInfo(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
  const dateFormatted = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  
  // Check if today or tomorrow
  let displayDay = dayName;
  if (date.toDateString() === today.toDateString()) {
    displayDay = "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    displayDay = "Tomorrow";
  }
  
  return { day: displayDay, date: dateFormatted };
}

/**
 * Get temperature string with unit
 * @param {number} temp - Temperature value
 * @returns {string} Temperature with unit symbol
 */
function getTempString(temp) {
  return `${Math.round(temp)}°${state.unit === "metric" ? "C" : "F"}`;
}

/**
 * Get wind speed string with unit
 * @param {number} speed - Wind speed value
 * @returns {string} Wind speed with unit
 */
function getWindString(speed) {
  if (state.unit === "metric") {
    return `${Math.round(speed * 3.6)} km/h`; // Convert m/s to km/h
  }
  return `${Math.round(speed)} mph`;
}

/**
 * Get visibility string
 * @param {number} visibility - Visibility in meters
 * @returns {string} Formatted visibility string
 */
function getVisibilityString(visibility) {
  if (state.unit === "metric") {
    return `${(visibility / 1000).toFixed(1)} km`;
  }
  return `${(visibility / 1609.34).toFixed(1)} mi`;
}

/**
 * Calculate sun position percentage
 * @param {number} sunrise - Sunrise timestamp
 * @param {number} sunset - Sunset timestamp
 * @returns {number} Percentage of day progress (0-100)
 */
function getSunPosition(sunrise, sunset) {
  const now = Date.now() / 1000;
  if (now < sunrise) return 0;
  if (now > sunset) return 100;
  const total = sunset - sunrise;
  const elapsed = now - sunrise;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

/**
 * Apply weather theme to body
 * @param {string} iconCode - Weather icon code from API
 */
function applyWeatherTheme(iconCode) {
  // Remove all weather classes
  Object.values(weatherThemes).forEach(theme => {
    elements.body.classList.remove(theme);
  });
  
  // Apply new theme
  const theme = weatherThemes[iconCode] || "weather-clear";
  if (!state.isDarkMode) {
    elements.body.classList.add(theme);
  }
}

// ========================================
// UI State Management
// ========================================

/**
 * Show loading state
 */
function showLoading() {
  elements.loadingState.classList.remove("hidden");
  elements.errorState.classList.add("hidden");
  elements.weatherContent.classList.add("hidden");
}

/**
 * Show error state
 * @param {string} message - Error message to display
 */
function showError(message) {
  elements.loadingState.classList.add("hidden");
  elements.errorState.classList.remove("hidden");
  elements.weatherContent.classList.add("hidden");
  elements.errorMsg.textContent = message;
}

/**
 * Show weather content
 */
function showWeather() {
  elements.loadingState.classList.add("hidden");
  elements.errorState.classList.add("hidden");
  elements.weatherContent.classList.remove("hidden");
}

// ========================================
// API Functions
// ========================================

/**
 * Fetch current weather data
 * @param {string} city - City name
 * @returns {Promise<object>} Weather data
 */
async function fetchCurrentWeather(city) {
  const url = `${API_BASE}/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${state.unit}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error("City not found. Please check the spelling and try again.");
  }
  
  return response.json();
}

/**
 * Fetch 5-day forecast data
 * @param {string} city - City name
 * @returns {Promise<object>} Forecast data
 */
async function fetchForecast(city) {
  const url = `${API_BASE}/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${state.unit}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error("Could not fetch forecast data.");
  }
  
  return response.json();
}

/**
 * Fetch city suggestions for autocomplete
 * @param {string} query - Search query
 * @returns {Promise<array>} Array of location objects
 */
async function fetchCitySuggestions(query) {
  const url = `${GEO_API}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    return [];
  }
  
  return response.json();
}

/**
 * Fetch weather by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object>} Weather data
 */
async function fetchWeatherByCoords(lat, lon) {
  const url = `${API_BASE}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${state.unit}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error("Could not fetch weather for your location.");
  }
  
  return response.json();
}

// ========================================
// Weather Display Functions
// ========================================

/**
 * Main function to fetch and display weather
 * @param {string} city - City name
 */
async function fetchWeather(city) {
  state.currentCity = city;
  showLoading();
  
  try {
    // Fetch both current weather and forecast in parallel
    const [weatherData, forecastData] = await Promise.all([
      fetchCurrentWeather(city),
      fetchForecast(city)
    ]);
    
    state.weatherData = weatherData;
    state.forecastData = forecastData;
    
    displayCurrentWeather(weatherData);
    displayHourlyForecast(forecastData);
    displayDailyForecast(forecastData);
    
    showWeather();
    
  } catch (error) {
    showError(error.message);
  }
}

/**
 * Display current weather data
 * @param {object} data - Weather API response
 */
function displayCurrentWeather(data) {
  const { main, weather, wind, visibility, sys, name } = data;
  const iconCode = weather[0].icon;
  
  // Apply theme based on weather
  applyWeatherTheme(iconCode);
  
  // Update location and date
  elements.cityName.textContent = `${name}, ${sys.country}`;
  elements.dateTime.textContent = formatDate(new Date());
  
  // Update main weather display
  elements.weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  elements.weatherIcon.alt = weather[0].description;
  elements.temperature.textContent = getTempString(main.temp);
  elements.feelsLike.textContent = `Feels like ${getTempString(main.feels_like)}`;
  elements.description.textContent = weather[0].description;
  
  // Update weather details
  elements.humidity.textContent = `${main.humidity}%`;
  elements.wind.textContent = getWindString(wind.speed);
  elements.pressure.textContent = `${main.pressure} hPa`;
  elements.visibility.textContent = getVisibilityString(visibility);
  
  // Update sun times
  elements.sunrise.textContent = formatTime(sys.sunrise);
  elements.sunset.textContent = formatTime(sys.sunset);
  
  // Update sun position indicator
  const sunProgress = getSunPosition(sys.sunrise, sys.sunset);
  elements.sunPosition.style.left = `${sunProgress}%`;
}

/**
 * Display hourly forecast (next 12 hours)
 * @param {object} data - Forecast API response
 */
function displayHourlyForecast(data) {
  elements.hourlyForecast.innerHTML = "";
  
  // Get next 12 entries (36 hours at 3-hour intervals, show 12)
  const hourlyData = data.list.slice(0, 12);
  
  hourlyData.forEach((item, index) => {
    const time = new Date(item.dt * 1000);
    const isNow = index === 0;
    
    const hourlyItem = document.createElement("div");
    hourlyItem.className = `hourly-item${isNow ? " active" : ""}`;
    hourlyItem.innerHTML = `
      <span class="hourly-time">${isNow ? "Now" : time.toLocaleTimeString("en-US", { hour: "numeric", hour12: true })}</span>
      <img class="hourly-icon" src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}"/>
      <span class="hourly-temp">${getTempString(item.main.temp)}</span>
    `;
    
    elements.hourlyForecast.appendChild(hourlyItem);
  });
}

/**
 * Display 5-day forecast
 * @param {object} data - Forecast API response
 */
function displayDailyForecast(data) {
  elements.forecast.innerHTML = "";
  
  // Group forecast data by day
  const dailyMap = new Map();
  
  data.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toDateString();
    
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        temps: [],
        icons: [],
        descriptions: [],
        date: item.dt_txt
      });
    }
    
    const dayData = dailyMap.get(dateKey);
    dayData.temps.push(item.main.temp);
    dayData.icons.push(item.weather[0].icon);
    dayData.descriptions.push(item.weather[0].description);
  });
  
  // Skip today, show next 5 days
  const days = Array.from(dailyMap.entries()).slice(1, 6);
  
  days.forEach(([dateKey, dayData]) => {
    const dayInfo = getDayInfo(dayData.date);
    const highTemp = Math.max(...dayData.temps);
    const lowTemp = Math.min(...dayData.temps);
    
    // Get most common icon (midday preferred)
    const middayIcon = dayData.icons[Math.floor(dayData.icons.length / 2)] || dayData.icons[0];
    const description = dayData.descriptions[Math.floor(dayData.descriptions.length / 2)] || dayData.descriptions[0];
    
    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <div class="forecast-day-info">
        <span class="forecast-day">${dayInfo.day}</span>
        <span class="forecast-date">${dayInfo.date}</span>
      </div>
      <div class="forecast-icon-wrapper">
        <img class="forecast-icon" src="https://openweathermap.org/img/wn/${middayIcon}@2x.png" alt="${description}"/>
      </div>
      <span class="forecast-description">${description}</span>
      <div class="forecast-temps">
        <span class="forecast-high">${getTempString(highTemp)}</span>
        <span class="forecast-low">${getTempString(lowTemp)}</span>
      </div>
    `;
    
    elements.forecast.appendChild(card);
  });
}

// ========================================
// Search & Autocomplete
// ========================================

let debounceTimer = null;

/**
 * Handle search input with debouncing
 * @param {Event} e - Input event
 */
function handleSearchInput(e) {
  const query = e.target.value.trim();
  
  clearTimeout(debounceTimer);
  
  if (query.length < 2) {
    elements.suggestions.classList.add("hidden");
    return;
  }
  
  debounceTimer = setTimeout(async () => {
    try {
      const locations = await fetchCitySuggestions(query);
      displaySuggestions(locations);
    } catch {
      elements.suggestions.classList.add("hidden");
    }
  }, 300);
}

/**
 * Display search suggestions
 * @param {array} locations - Array of location objects
 */
function displaySuggestions(locations) {
  elements.suggestions.innerHTML = "";
  
  if (locations.length === 0) {
    elements.suggestions.classList.add("hidden");
    return;
  }
  
  locations.forEach(location => {
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    
    // Build location name with state and country
    let locationName = location.name;
    if (location.state) {
      locationName += `, ${location.state}`;
    }
    locationName += `, ${location.country}`;
    
    li.textContent = locationName;
    
    li.addEventListener("click", () => {
      elements.cityInput.value = locationName;
      fetchWeather(location.name);
      elements.suggestions.classList.add("hidden");
    });
    
    elements.suggestions.appendChild(li);
  });
  
  elements.suggestions.classList.remove("hidden");
}

// ========================================
// Event Handlers
// ========================================

/**
 * Handle search button click
 */
function handleSearch() {
  const city = elements.cityInput.value.trim();
  if (!city) return;
  fetchWeather(city);
  elements.suggestions.classList.add("hidden");
}

/**
 * Handle Enter key in search input
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleSearchKeydown(e) {
  if (e.key === "Enter") {
    handleSearch();
  }
}

/**
 * Handle unit toggle
 */
function handleUnitToggle() {
  state.unit = state.unit === "metric" ? "imperial" : "metric";
  elements.unitDisplay.textContent = state.unit === "metric" ? "°C" : "°F";
  
  // Refresh weather if we have data
  if (state.currentCity) {
    fetchWeather(state.currentCity);
  }
}

/**
 * Handle dark mode toggle
 */
function handleDarkModeToggle() {
  state.isDarkMode = !state.isDarkMode;
  elements.body.classList.toggle("dark-mode");
  
  // Toggle icon visibility
  const sunIcon = elements.darkModeToggle.querySelector(".icon-sun");
  const moonIcon = elements.darkModeToggle.querySelector(".icon-moon");
  
  sunIcon.classList.toggle("hidden");
  moonIcon.classList.toggle("hidden");
}

/**
 * Handle retry button click
 */
function handleRetry() {
  if (state.currentCity) {
    fetchWeather(state.currentCity);
  } else {
    elements.errorState.classList.add("hidden");
  }
}

/**
 * Initialize geolocation weather
 */
function initGeolocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          showLoading();
          const { latitude, longitude } = pos.coords;
          const data = await fetchWeatherByCoords(latitude, longitude);
          fetchWeather(data.name);
        } catch (error) {
          // Silent fail - user can search manually
          elements.loadingState.classList.add("hidden");
        }
      },
      () => {
        // Geolocation denied or error - silent fail
      }
    );
  }
}

/**
 * Close suggestions when clicking outside
 * @param {Event} e - Click event
 */
function handleClickOutside(e) {
  if (!elements.suggestions.contains(e.target) && e.target !== elements.cityInput) {
    elements.suggestions.classList.add("hidden");
  }
}

// ========================================
// Initialization
// ========================================

/**
 * Initialize the app
 */
function init() {
  // Attach event listeners
  elements.searchBtn.addEventListener("click", handleSearch);
  elements.cityInput.addEventListener("input", handleSearchInput);
  elements.cityInput.addEventListener("keydown", handleSearchKeydown);
  elements.unitToggle.addEventListener("click", handleUnitToggle);
  elements.darkModeToggle.addEventListener("click", handleDarkModeToggle);
  elements.retryBtn.addEventListener("click", handleRetry);
  document.addEventListener("click", handleClickOutside);
  
  // Initialize geolocation
  initGeolocation();
}

// Start the app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
