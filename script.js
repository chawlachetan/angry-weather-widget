const txt = document.getElementById("weatherText");
const sub = document.getElementById("subText");
const tempEl = document.getElementById("temp");
const iconEl = document.getElementById("icon");

const moods = {
  clear: [
    ["Too f***ing bright out here.", "Where are my sunnies?!"],
    ["Sun’s flexing again.", "Hot as Satan’s armpit."]
  ],
  cloud: [
    ["Sky looks hungover.", "Perfect match for my mood."],
    ["Grey as my soul.", "Still better than Mondays."]
  ],
  fog: [
    ["Can’t <span class='highlight'>f***ing</span> see <span class='highlight'>shit</span> captain.", "I mean, come on?!"],
    ["Thicker than your ex’s excuses.", "Drive safe, maybe."]
  ],
  rain: [
    ["It’s <span class='highlight'>f***ing</span> raining again.", "Umbrella? Nah, just vibes."],
    ["Wet. Cold. Miserable.", "Classic."]
  ],
  snow: [
    ["Cold as <span class='highlight'>f***</span>.", "Even my feelings froze."],
    ["Beautiful… until you step in it.", "10/10 regret."]
  ],
  unknown: [
    ["Weather’s drunk again.", "No idea what’s happening."],
  ]
};

function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

function __wweb2JsWidgetTitle() { return "Angry Weather"; }

navigator.geolocation.getCurrentPosition(async pos=>{
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode`;
  const res = await fetch(url);
  const data = await res.json();
  const code = data.current.weathercode;
  const t = Math.round(data.current.temperature_2m);
  tempEl.textContent = `${t}°`;

  let moodKey = "unknown", bg = "bg_clear.jpg", icon = "☀️";
  if ([0,1].includes(code)) { moodKey="clear"; bg="bg_clear.jpg"; icon="☀️";}
  else if ([2,3].includes(code)) { moodKey="cloud"; bg="bg_cloud.jpg"; icon="☁️";}
  else if ([45,48].includes(code)) { moodKey="fog"; bg="bg_fog.jpg"; icon="🌫️";}
  else if ([51,61,63,80].includes(code)) { moodKey="rain"; bg="bg_rain.jpg"; icon="🌧️";}
  else if ([71,73,75].includes(code)) { moodKey="snow"; bg="bg_snow.jpg"; icon="❄️";}
  
  document.body.style.backgroundImage = `url('${bg}')`;
  iconEl.textContent = icon;

  const lines = pick(moods[moodKey]);
  txt.innerHTML = lines[0];
  sub.textContent = lines[1];
},()=>{
  txt.innerHTML = "Location off?";
  sub.textContent = "Then guess the weather yourself.";
});
