// const apiKey = "";
// require('dotenv').config();
// const apiKey = process.env.API_KEY;
// const apiKey = '{{ secrets.API_KEY }}';
const apiKey = window.ENV.API_KEY;
const weatherUrl = "https://api.openweathermap.org/data/2.5/weather";
const iconUrl = "https://openweathermap.org/img/wn/";
const weatherIcon = document.querySelector(".weather-icon");
const searchBox = document.querySelector(".search input");
const searchButton = document.querySelector(".search svg");
const tabInputs = document.querySelectorAll('.tab-dock input[type="radio"]');
const inputField = document.getElementById('inputField');
const errorDisplay = document.querySelector(".error");
const weatherDisplay = document.querySelector(".weather");
let selectedTabIndex = -1;

// Check if the Geolocation API is supported
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(fetchLocationWeatherData, handleGeolocationError);
} else {
    console.log("Geolocation is not supported by this browser.");
}

tabInputs.forEach((input, index) => {
    input.addEventListener('change', () => {
        if (input.checked) {
            selectedTabIndex = index;
            inputField.value = "";
        }
    });
});

function fetchLocationWeatherData(position) {
    const url = generateUrl(position);
    if (url) {
        fetchWeather(url)
            .then(weatherData => {
                errorDisplay.style.display = "none";
                weatherDisplay.style.display = "block";
                displayWeatherData(weatherData);
            })
            .catch(error => {
                console.log(error);
                errorDisplay.style.display = "block";
                weatherDisplay.style.display = "none";
            });
    } else {
        console.log("Invalid URL or search input.");
    }
}

function generateUrl(position) {
    if (selectedTabIndex === -1 && position) {
        const { latitude, longitude } = position.coords;
        return `${weatherUrl}?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    }
    return null;
}

function fetchWeather(url) {
    return fetch(url)
        .then(response => {
            if (response.status === 404) {
                throw new Error("Location not found");
            }
            return response.json();
        });
}

function displayWeatherData(weatherData) {
    const cityElement = document.querySelector('.city');
    const tempElement = document.querySelector('.temp');
    const humidityElement = document.querySelector('.humidity');
    const windElement = document.querySelector('.wind');

    cityElement.textContent = weatherData.name;
    tempElement.textContent = `${Math.round(weatherData.main.temp)} °C`;
    humidityElement.textContent = `${weatherData.main.humidity} %`;
    windElement.textContent = `${weatherData.wind.speed} km/h`;

    weatherIcon.src = iconUrl + `${weatherData.weather[0].icon}` + "@4x.png";
}


function handleGeolocationError(error) {
    console.log("Error getting location: " + error.message);
}

searchButton.addEventListener("click", () => {
    const url = generateUrlFromInput();
    if (url) {
        fetchWeather(url)
            .then(weatherData => {
                errorDisplay.style.display = "none";
                weatherDisplay.style.display = "block";
                displayWeatherData(weatherData);
            })
            .catch(error => {
                console.log(error);
                errorDisplay.style.display = "block";
                weatherDisplay.style.display = "none";
            });
    } else {
        console.log("Invalid URL or search input.");
    }
});

function generateUrlFromInput() {
    if (searchBox.value) {
        let url = "";
        switch (selectedTabIndex) {
            case 0:
                url = `${weatherUrl}?q=${searchBox.value}&appid=${apiKey}&units=metric`;
                break;
            case 1:
                url = `${weatherUrl}?zip=${searchBox.value}&appid=${apiKey}&units=metric`;
                break;
            case 2:
                const [lat, lon] = searchBox.value.match(/-?\d+/g).map(Number);
                url = `${weatherUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
                break;
        }
        return url;
    }
    return null;
}