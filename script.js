const weatherText = document.getElementById("weatherText");
const background = document.getElementById("container");

function __wweb2JsWidgetTitle() {
  return "Angry Weather";
}

async function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode`;
  const res = await fetch(url);
  const data = await res.json();
  const code = data.current.weathercode;
  const temp = data.current.temperature_2m;
  return { code, temp };
}

function getMood(code) {
  if ([0, 1].includes(code)) return ["It's bloody sunny!", "Where are my sunnies?"];
  if ([2, 3].includes(code)) return ["Clouds everywhere, mood ruined.", "Grey skies, grey mood."];
  if ([45, 48].includes(code)) return ["Can't f***ing see shit, Captain.", "Fog's thicker than my patience."];
  if ([51, 61, 80].includes(code)) return ["It's raining again, ffs.", "Hope you brought a bloody umbrella."];
  if ([71, 73, 75].includes(code)) return ["Snow? Seriously? Nope.", "Cold as my ex’s heart."];
  return ["The weather’s confused. Same, bro.", "No idea what’s happening up there."];
}

function updateUI(msg) {
  weatherText.innerText = msg;
}

navigator.geolocation.getCurrentPosition(async pos => {
  const { latitude, longitude } = pos.coords;
  try {
    const { code } = await getWeather(latitude, longitude);
    const moodList = getMood(code);
    const msg = moodList[Math.floor(Math.random() * moodList.length)];
    updateUI(msg);
  } catch (e) {
    updateUI("Can't fetch weather. The internet's being a dick.");
  }
}, () => {
  updateUI("Location off? Then guess the f***ing weather yourself.");
});
