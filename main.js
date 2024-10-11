// Блок погоды
// 1. Состоит из города (текстовое поле)
// 2. Отображения температуры
// 3. Отображения текущей погоды (дождь/солнечная/снег/пасмурно)
// Функционал:


// Для хранения населённого пункта используется локальное хранилище — local storage.



const api_key = "7281597ddeb14d7d8bebbcfade961904"
const cityInput = document.getElementById('city')
const tempView = document.getElementById('weather_temp')
const descriptionView = document.getElementById('weather_description')
const weatherImg = document.getElementById('weather_img')

async function getCoordinatesWeather([lat, lon]) // Для получения прогноза погоды использовать список api (любой из списка можно использовать)
{
    var response = await fetch(`https://api.weatherbit.io/v2.0/current?key=${api_key}&lang=ru&lat=${lat}&lon=${lon}`)
    var responseJson = await response.json()
    tempView.innerText = `Температура: ${responseJson.data[0].app_temp}°C`
    descriptionView.innerText = `Condition: ${responseJson.data[0].weather.description}`
    weatherImg.src = `https://www.weatherbit.io/static/img/icons/${responseJson.data[0].weather.icon}.png`
}
async function getCitysWeather(city) 
{
    var response = await fetch(`https://api.weatherbit.io/v2.0/current?key=${api_key}&lang=ru&city=${city}`)
    var responseJson = await response.json()
    console.log(responseJson)
    tempView.innerText = `Температура: ${responseJson.data[0].app_temp}°C`
    descriptionView.innerText = `Описание: ${responseJson.data[0].weather.description}`
    weatherImg.src = `https://www.weatherbit.io/static/img/icons/${responseJson.data[0].weather.icon}.png`
}
function initWeather() {
    let savedCity = localStorage.getItem('city')

    if (savedCity == null) { //если localStorage не содержит города, то получаем город по геолокации 
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => { // Для определения текущего города использовать geolocation api, город по умолчанию — Краснодар
                const latitude = position.coords.latitude
                const longitude = position.coords.longitude
                
                ymaps.ready(async () => {
                    var res = await ymaps.geocode([latitude, longitude])
                    var firstGeoObject = res.geoObjects.get(0)
                    console.log("geo locales", firstGeoObject.getLocalities()[0])
                    savedCity = firstGeoObject.getLocalities()[0]
                    cityInput.value = savedCity
                    localStorage.setItem('city', savedCity)
                })
                getCoordinatesWeather([latitude, longitude])
            })
        }
        else {
            console.log("Geolocation is not supported by this browser.")
            localStorage.setItem('city', 'Краснодар')
        }
    }
    else {
        cityInput.value = savedCity
        getCitysWeather(savedCity)
    }
    
}
cityInput.addEventListener('change', () => {
    const newCity = cityInput.value
    localStorage.setItem('city', newCity)
    getCitysWeather(newCity)
})

// Логика отображения времени и даты
const timeDisplay = document.getElementById('time')
const dateDisplay = document.getElementById('date')

function updateTime() {
    const now = new Date()
    timeDisplay.innerText = now.toLocaleTimeString()
    dateDisplay.innerText = now.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        weekday: 'long'
    })
}
setInterval(updateTime, 1000)

// Логика изменения фона
const backgrounds = [
    'url(./imgs/night.jpg)',
    'url(./imgs/morning.jpg)',
    'url(./imgs/afternoon.jpg)',
    'url(./imgs/evening.jpg)',
]
function setBackgroundImage() {
    const currentHour = new Date().getHours()
    let index
    if (currentHour >= 0 && currentHour < 6) index = 0
    else if (currentHour >= 6 && currentHour < 12) index = 1
    else if (currentHour >= 12 && currentHour < 18) index = 2
    else index = 3
    document.body.style.backgroundImage = backgrounds[index]
}


// Tasks Block
const taskInput = document.getElementById('task_creater')
const tasksList = document.getElementById('task_list')
const tasks = JSON.parse(localStorage.getItem('tasks')) || [{ "text": "для добавления задачи ее нужно ввести и нажать Enter, для удаления нажать кнопку удаления справа.", "completed": false },
    {"text":"взять автора данного приложения на работу","completed":false}
]

function renderTasks() {
    tasksList.innerHTML = ''
    tasks.forEach((task, index) => {
        if (!task.completed) {
            const li = document.createElement('li')
            li.innerHTML = `
            <input type="checkbox" onclick="setAsCompleted(${index})">
            <span>${task.text}</span>
            <button onclick="removeTask(${index})"></button>
            `
            tasksList.appendChild(li)
        }
    })
}

function addTask(task) {
    tasks.push({ text: task, completed: false })
    localStorage.setItem('tasks', JSON.stringify(tasks))
    console.log(JSON.stringify(tasks))
    renderTasks()
}

function removeTask(index) {
    tasks.splice(index, 1)
    localStorage.setItem('tasks', JSON.stringify(tasks))
    renderTasks()
}
function setAsCompleted(index) {
    tasks[index].completed = true
    localStorage.setItem('tasks', JSON.stringify(tasks))
}
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (taskInput.value.trim() == '') {
            taskInput.classList.add("invalid")
        }
        else {
            addTask(taskInput.value)
            taskInput.value = ''
            taskInput.classList.remove("invalid")
        }
    }
})

window.onload = function () {
    initWeather()
    setBackgroundImage()
    renderTasks()
}