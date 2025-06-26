const apiKey = "e0a60ea474767c2b20eebde461aed9ca";
let unit = "metric"; // default to Celsius
let currentCity = "";

function fetchWeather(city) {
  currentCity = city;
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`;

  fetch(weatherUrl)
    .then(res => {
      if (!res.ok) throw new Error("City not found");
      return res.json();
    })
    .then(data => {
      const temp = Math.round(data.main.temp);
      const desc = data.weather[0].description;
      const icon = data.weather[0].icon;

      document.getElementById("cityName").textContent = data.name;
      document.getElementById("temperature").textContent = `${temp}°${unit === "metric" ? "C" : "F"}`;
      document.getElementById("description").textContent = desc;
      document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${icon}@2x.png`;

      document.getElementById("weatherInfo").classList.remove("hidden");
      document.getElementById("errorMsg").classList.add("hidden");
    })
    .catch(err => {
      document.getElementById("errorMsg").textContent = err.message;
      document.getElementById("errorMsg").classList.remove("hidden");
      document.getElementById("weatherInfo").classList.add("hidden");
    });

  fetch(forecastUrl)
    .then(res => res.json())
    .then(data => {
      const forecastEl = document.getElementById("forecast");
      forecastEl.innerHTML = "";

      const dailyMap = new Map();

      data.list.forEach(entry => {
        if (entry.dt_txt.includes("12:00:00")) {
          const date = new Date(entry.dt_txt);
          dailyMap.set(date.toDateString(), {
            temp: Math.round(entry.main.temp),
            icon: entry.weather[0].icon,
          });
        }
      });

      let dayCount = 0;
      for (let [day, info] of dailyMap) {
        if (dayCount++ >= 5) break;
        const card = document.createElement("div");
        card.className = "forecast-card";
        card.innerHTML = `
          <div>${day.split(" ")[0]}</div>
          <img src="https://openweathermap.org/img/wn/${info.icon}@2x.png" alt="">
          <div>${info.temp}°${unit === "metric" ? "C" : "F"}</div>
        `;
        forecastEl.appendChild(card);
      }

      forecastEl.classList.remove("hidden");
    });
}

document.getElementById("searchBtn").addEventListener("click", () => {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return;
  fetchWeather(city);
});

document.getElementById("unitToggle").addEventListener("click", () => {
  unit = unit === "metric" ? "imperial" : "metric";
  document.getElementById("unitToggle").textContent =
    unit === "metric" ? "Switch to °F" : "Switch to °C";
  if (currentCity) fetchWeather(currentCity);
});

window.addEventListener("load", () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      const geoUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

      fetch(geoUrl)
        .then(res => res.json())
        .then(data => {
          fetchWeather(data.name);
        });
    });
  }
});

let debounceTimer;

document.getElementById("cityInput").addEventListener("input", (e) => {
  const query = e.target.value.trim();
  clearTimeout(debounceTimer);
  if (query.length < 2) {
    document.getElementById("suggestions").classList.add("hidden");
    return;
  }

  debounceTimer = setTimeout(() => {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;

    fetch(geoUrl)
      .then(res => res.json())
      .then(data => {
        const suggestions = document.getElementById("suggestions");
        suggestions.innerHTML = "";

        if (data.length === 0) {
          suggestions.classList.add("hidden");
          return;
        }

        data.forEach(location => {
          const li = document.createElement("li");
          const name = `${location.name}, ${location.state || ""}, ${location.country}`;
          li.textContent = name;
          li.addEventListener("click", () => {
            document.getElementById("cityInput").value = name;
            fetchWeather(location.name);
            suggestions.classList.add("hidden");
          });
          suggestions.appendChild(li);
        });

        suggestions.classList.remove("hidden");
      });
  }, 300);
});
