// define the API url
const baseEndpoint = "https://api.openweathermap.org/data/2.5/weather?";
const myKey = "&appid=da8def9c2ced5dc8a3bc3a8e81ad2333";
let iconUrl = "";

let cityName = "";
let currentLocation = {};
let searchHistory = [];
let GeoCorEndPoint = "";
let cityNameEndPoint = "";

// select the container
const mainContainer = document.querySelector(".mainContainer");
const contentContainer = document.querySelector(".contentContainer");
const status = document.querySelector("#status");
const searchBtn = document.querySelector('button[name="searchBtn"]');
const searchField = document.querySelector('input[name="searchField"]');
const searchResults = document.querySelector(".searchResults");
const noSearchMsg = document.querySelector(".noSearchMsg");
const currentLocationWeatherContainer = document.querySelector(
  ".currentLocationWeatherContainer",
);
// clear search field on reload
searchField.value = "";
// declare array variables to store the data
// full data
let currentLocationData = [];
let searchLocationData = [];
// chosen data
let currentLocationWeather = {};
let searchLocationWeather = "";
// load geo locator on page load and display data
window.addEventListener("load", geoFindMe);

// click on button and pull the input value from the input field on page
searchBtn.addEventListener("click", handleSearchClick);
searchField.addEventListener("keydown", handleSearchKeydown);
// get geo location and store in a global object
function geoFindMe() {
  // if recovering position is successful:
  async function success(position) {
    // save location coordinates to global object
    currentLocation.lat = position.coords.latitude;
    currentLocation.lon = position.coords.longitude;
    // delete status msg

    status.textContent = "";
    status.hidden = true;
    // update url of the api to local coordinates
    GeoCorEndPoint = `${baseEndpoint}lat=${currentLocation.lat}&lon=${currentLocation.lon}&units=metric${myKey}`;
    // fetch data from api about local weather
    currentLocationData = await fetchUrl(GeoCorEndPoint);
    // send data to function to pull relevant data
    const localWeatherObj = CreatWeatherObj(currentLocationData);
    displayWeatherCard(await localWeatherObj, currentLocationWeatherContainer);
  }

  function error() {
    status.hidden = false;

    status.textContent = "Please give permission to use your location";
  }

  if (!navigator.geolocation) {
    status.hidden = false;

    status.textContent = "Geolocation is not supported by your browser";
  } else {
    status.hidden = false;

    status.textContent = "Locating…";
    navigator.geolocation.getCurrentPosition(success, error);
  }
}

// fetch data generic function
async function fetchUrl(url) {
  const response = await fetch(url);
  const data = await response.json();
  console.log("data from", url, data, response);
  return data;
}

// convert ms to timeObj
function convertMS(sec) {
  if (isNaN(sec) || sec < 0) {
    return null;
  }
  let date = new Date(sec * 1000);
  let time = date.toLocaleTimeString();
  return time;
}

// extract local weather from data to an object
async function CreatWeatherObj(data) {
  currentLocationWeather = {
    weather: data.weather[0].description,
    iconUrl: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
    city: data.name,
    country: data.sys.country,
    temp: data.main.temp,
    sunrise: convertMS(data.sys.sunrise),
    sunset: convertMS(data.sys.sunset),
  };
  return currentLocationWeather;
}

// display local weather
async function creatWeatherCardHtml(weatherObj) {
  return `<h2>Current Weather in ${weatherObj.city}, ${weatherObj.country}</h2>
  <div class="imgAndInfo">
    <div class="weatherImg">
      <img src="${weatherObj.iconUrl}" alt="${weatherObj.weather}">
      <p>${weatherObj.temp} &#8451</p>
      <p>${weatherObj.weather}</p>
    </div>
    <div class="weatherInfo">
      <h3>Sunrise Time</h3>
      <p>${weatherObj.sunrise}</p>
      <h3>Sunset Time</h3>
      <p>${weatherObj.sunset}</p>
    </div>
  </div>`;
}
async function displayWeatherCard(weatherObj, parent) {
  const html = await creatWeatherCardHtml(weatherObj);
  parent.insertAdjacentHTML("afterbegin", html);
}
async function displaySearchWeather(cityName, weatherObj) {
  noSearchMsg.textContent = "loading...";
  const searchResultCard = document.createElement("div");
  searchResultCard.classList.add("searchResultCard");
  displayWeatherCard(await weatherObj, searchResultCard);
  searchResults.appendChild(searchResultCard);
  noSearchMsg.textContent = "";
  searchHistory.push(cityName);
}
// extract weather of search city from data
async function getSearchWeather(data) {
  searchLocationWeather = data.main.temp;
  return searchLocationWeather;
}

function handleSearchKeydown(event) {
  if (event.key === "Enter") {
    handleSearchClick();
  }
}
async function handleSearchClick() {
  cityName = searchField.value;
  cityNameEndPoint = `${baseEndpoint}q=${cityName}&units=metric${myKey}`;
  searchLocationData = await fetchUrl(cityNameEndPoint);
  console.log(searchLocationData);
  if ((await checkInput(searchLocationData, cityName)) === true) {
    status.textContent = "";
    status.hidden = true;
    const weatherObj = CreatWeatherObj(searchLocationData);
    displaySearchWeather(cityName, weatherObj);
  }
}

async function checkInput(data, cityName) {
  if (!data.name) {
    console.log(data.cod);
    status.hidden = false;
    status.textContent = "No such location was found";
    return false;
  } else if (searchHistory.includes(cityName)) {
    status.hidden = false;
    status.textContent = "This location is already displayed";
    return false;
  } else return true;
}
