# ☀️ Weather Pro

A stunning, portfolio-quality weather application with a modern, professional design showcasing advanced frontend development skills. Features glassmorphism effects, dynamic weather themes, and smooth animations.

![Weather Pro](https://github.com/user-attachments/assets/10229a35-a8e2-4f2f-9ccb-bb6ed6348a63)

## ✨ Features

### Core Weather Features
- 📍 **Auto Location Detection** - Automatically detects and shows weather for your location
- 🌡️ **Temperature Toggle** - Switch between Celsius and Fahrenheit with one click
- 🕐 **Hourly Forecast** - See weather predictions for the next 12 hours
- 📅 **5-Day Forecast** - Extended forecast with high/low temperatures
- 💧 **Detailed Conditions** - Humidity, wind speed, pressure, and visibility

### Modern UI/UX
- 🎨 **Glassmorphism Design** - Beautiful frosted glass effects with depth
- 🌈 **Dynamic Weather Themes** - Background changes based on weather conditions
- 🌙 **Dark Mode** - Toggle between light and dark themes
- ✨ **Smooth Animations** - Micro-interactions and transition effects
- 📱 **Fully Responsive** - Perfect on mobile, tablet, and desktop

### Enhanced Experience
- 🔍 **Smart Search** - Autocomplete suggestions with city, state, and country
- 🌅 **Sunrise/Sunset** - Visual indicator showing current sun position
- ⚡ **Loading States** - Skeleton loaders for smooth experience
- ⚠️ **Error Handling** - Friendly error messages with retry options
- ♿ **Accessible** - ARIA labels and keyboard navigation support

## 🛠️ Built With

- **HTML5** - Semantic markup with accessibility features
- **CSS3** - Modern styling with CSS custom properties, flexbox, and grid
- **JavaScript (ES6+)** - Async/await, modules, and modern patterns
- **[OpenWeather API](https://openweathermap.org/api)** - Weather data provider

## 📸 Screenshots

### Light Mode
![Light Mode](https://github.com/user-attachments/assets/10229a35-a8e2-4f2f-9ccb-bb6ed6348a63)

### Dark Mode
![Dark Mode](https://github.com/user-attachments/assets/a0fa815f-1956-4399-8f48-53f035202141)

### Mobile Responsive
![Mobile View](https://github.com/user-attachments/assets/e5cef916-3c87-4896-b298-17c900308755)

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or dependencies required!

### Installation

1. **Clone the Repository**
```bash
git clone https://github.com/dhruvvdave/weather-app.git
cd weather-app
```

2. **Open in Browser**
Simply open `index.html` in your browser, or use a local server:
```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve
```

3. **Allow Location Access** (Optional)
For automatic location detection, allow browser location access when prompted.

## 📁 Project Structure

```
weather-app/
├── index.html      # Main HTML structure with semantic markup
├── style.css       # Modern CSS with variables and animations
├── script.js       # JavaScript with async/await and API integration
└── README.md       # Project documentation
```

## 🎨 Design Features

### Color Palette
The app uses dynamic color themes based on weather conditions:
- ☀️ **Clear Sky** - Bright blue gradient
- ☁️ **Cloudy** - Soft gray-blue gradient
- 🌧️ **Rain** - Muted gray-green gradient
- ❄️ **Snow** - Light gray gradient
- ⛈️ **Thunder** - Dark purple-blue gradient
- 🌙 **Night** - Deep purple gradient

### Typography
- **Poppins** - Headlines and titles
- **Inter** - Body text and UI elements

## 🔧 Customization

### API Key
The app uses a demo API key. For production use, replace it with your own:
```javascript
const apiKey = "your-api-key-here";
```

Get your free API key at [OpenWeather](https://openweathermap.org/api).

## 📄 License

This project is open source and available for personal and educational use.

## 🙏 Acknowledgments

- Weather data provided by [OpenWeather API](https://openweathermap.org/)
- Inspired by modern weather apps like Apple Weather and Google Weather
- Built as a portfolio project to demonstrate frontend development skills
