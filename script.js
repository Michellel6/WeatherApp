const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const city = document.getElementById("city");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");

const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const forecastCards = document.getElementById("forecastCards");

const loading = document.getElementById("loading");
const favoriteBtn = document.getElementById("favoriteBtn");
const favoritesList = document.getElementById("favoritesList");
let chart;
let cityTimezone = 0;
function updateLocalClock(){

    const now = new Date();

    document.getElementById("localDate").textContent =
        now.toDateString();

    document.getElementById("localTime").textContent =
        now.toLocaleTimeString();

}

setInterval(updateLocalClock,1000);

updateLocalClock();

searchBtn.addEventListener("click",()=>{

    const cityName = cityInput.value.trim();

    if(cityName){

        getWeather(cityName);

    }

});
cityInput.addEventListener("keypress",(e)=>{

    if(e.key==="Enter"){

        getWeather(cityInput.value);

    }

});
async function getWeather(cityName){

loading.classList.remove("hidden");

try{

const response = await fetch(

`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`

);

if(!response.ok){

throw new Error("City not found");

}

const data = await response.json();

displayWeather(data);

getForecast(cityName);

changeBackground(data.weather[0].main);

}catch(error){

alert(error.message);

}

loading.classList.add("hidden");

}
function displayWeather(data){

cityTimezone = data.timezone;
city.innerHTML =
`${data.name}, ${data.sys.country}`;

temperature.innerHTML =
`${Math.round(data.main.temp)}°C`;

description.innerHTML =
data.weather[0].description;

weatherIcon.src =
`https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

feelsLike.innerHTML =
`${Math.round(data.main.feels_like)}°C`;

humidity.innerHTML =
`${data.main.humidity}%`;

wind.innerHTML =
`${data.wind.speed} km/h`;

pressure.innerHTML =
`${data.main.pressure} hPa`;

visibility.innerHTML =
`${data.visibility/1000} km`;

sunrise.innerHTML =
new Date(data.sys.sunrise*1000)
.toLocaleTimeString();

sunset.innerHTML =
new Date(data.sys.sunset*1000)
.toLocaleTimeString();

}
locationBtn.addEventListener("click",()=>{

navigator.geolocation.getCurrentPosition(position=>{

const lat = position.coords.latitude;

const lon = position.coords.longitude;

getWeatherByLocation(lat,lon);

});

});
async function getWeatherByLocation(lat,lon){

loading.classList.remove("hidden");

const response = await fetch(

`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`

);

const data = await response.json();

displayWeather(data);

saveSearch(data.name);

getForecast(cityName);

changeBackground(data.weather[0].main);

loading.classList.add("hidden");

}
function changeBackground(weather){

switch(weather){

case "Clear":

document.body.style.background =
"linear-gradient(135deg,#56CCF2,#2F80ED)";
break;

case "Clouds":

document.body.style.background =
"linear-gradient(135deg,#BDC3C7,#2C3E50)";
break;

case "Rain":

document.body.style.background =
"linear-gradient(135deg,#485563,#29323C)";
break;

case "Snow":

document.body.style.background =
"linear-gradient(135deg,#E6DADA,#274046)";
break;

case "Thunderstorm":

document.body.style.background =
"linear-gradient(135deg,#232526,#414345)";
break;

default:

document.body.style.background =
"linear-gradient(135deg,#4facfe,#00f2fe)";

}

}
function saveSearch(city){

let history = JSON.parse(localStorage.getItem("history")) || [];

if(!history.includes(city)){

history.unshift(city);

}

history = history.slice(0,5);

localStorage.setItem("history",JSON.stringify(history));

}

window.onload = ()=>{
    loadFavorites();

const history = JSON.parse(localStorage.getItem("history"));

if(history && history.length){

getWeather(history[0]);

}else{

getWeather("Pretoria");

}

}
function toggleDarkMode(){

document.body.classList.toggle("dark");

}
async function getForecast(cityName){

    const response = await fetch(

    `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`

    );

    const data = await response.json();

    displayForecast(data);

    drawChart(data);

}
function displayForecast(data){

    forecastCards.innerHTML="";

    const daily=[];

    data.list.forEach(item=>{

        if(item.dt_txt.includes("12:00:00")){

            daily.push(item);

        }

    });

    daily.forEach(day=>{

        forecastCards.innerHTML += `

        <div class="forecast-card">

            <h3>${new Date(day.dt_txt).toLocaleDateString("en-US",{weekday:"short"})}</h3>

            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">

            <p>${Math.round(day.main.temp)}°C</p>

            <p>${day.weather[0].main}</p>

        </div>

        `;

    });

}
function drawChart(data){

    const labels=[];

    const temps=[];

    data.list.slice(0,8).forEach(item=>{

        labels.push(new Date(item.dt_txt).getHours()+":00");

        temps.push(item.main.temp);

    });

    if(chart){

        chart.destroy();

    }

    chart=new Chart(

        document.getElementById("tempChart"),

        {

            type:"line",

            data:{

                labels,

                datasets:[{

                    label:"Temperature °C",

                    data:temps,

                    tension:0.4

                }]

            }

        }

    );

}

function updateCityClock(){

    if(cityTimezone === 0) return;

    // Current UTC time
    const nowUTC = new Date(
        Date.now() + new Date().getTimezoneOffset() * 60000
    );

    // Add the searched city's timezone offset
    const cityNow = new Date(nowUTC.getTime() + cityTimezone * 1000);

    document.getElementById("cityDate").textContent =
        cityNow.toDateString();

    document.getElementById("cityTime").textContent =
        cityNow.toLocaleTimeString();

}
setInterval(updateCityClock,1000);
function saveFavorite(cityName) {

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (!favorites.includes(cityName)) {
        favorites.push(cityName);
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }

    loadFavorites();
}
function loadFavorites() {

    favoritesList.innerHTML = "";

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    favorites.forEach(cityName => {

        const button = document.createElement("button");

        button.textContent = cityName;

        button.onclick = () => getWeather(cityName);

        favoritesList.appendChild(button);

    });

}
favoriteBtn.addEventListener("click", () => {

    if (city.textContent !== "") {

        const cityName = city.textContent.split(",")[0];

        saveFavorite(cityName);

    }

});