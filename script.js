/* ---------- tiny cookie helpers ---------- */
function setCookie(name, value, days=3650){
  const d = new Date();
  d.setTime(d.getTime() + (days*24*60*60*1000));
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/`;
}
function getCookie(name){
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}

/* ---------- DOM ---------- */
const $ = (id)=>document.getElementById(id);
const bg = $("bg"), headline = $("headline"), sub = $("sub");
const wxIcon = $("wxIcon"), wxTemp = $("wxTemp");
const settings = $("settings");
const sizeLabel = $("sizeLabel");

const sizeSteps = [
  {key:"S", px:260, label:"Small"},
  {key:"M", px:320, label:"Medium"},
  {key:"L", px:380, label:"Large"},
];

/* ---------- state ---------- */
let sizeIndex = Math.max(0, sizeSteps.findIndex(s => s.key === (getCookie("aw_size") || "M")));
if (sizeIndex === -1) sizeIndex = 1;
let swearsOn = (getCookie("aw_swears") ?? "1") === "1";

function applySize(){
  const s = sizeSteps[sizeIndex];
  document.documentElement.style.setProperty("--cardSize", s.px + "px");
  sizeLabel.textContent = s.label;
  setCookie("aw_size", s.key);
}

/* ---------- weather -> condition mapping ---------- */
function mapCondition(code, isDay){
  // returns {key, emoji, query, accent}
  if ([0,1].includes(code)) return isDay
    ? {key:"clear", emoji:"☀️", query:"sunny minimal landscape", accent:"#ffae00"}
    : {key:"night", emoji:"🌙", query:"night city aesthetic", accent:"#9ad3ff"};

  if ([2,3].includes(code)) return {key:"cloud", emoji:"☁️", query:"moody cloudy sky", accent:"#7fb4ff"};
  if ([45,48].includes(code)) return {key:"fog", emoji:"🌫️", query:"foggy ship sea cinematic", accent:"#b88cff"};
  if ([51,53,55,61,63,65,80,81,82].includes(code)) return {key:"rain", emoji:"🌧️", query:"rain storm cinematic", accent:"#4cc2ff"};
  if ([71,73,75,85,86].includes(code)) return {key:"snow", emoji:"❄️", query:"snow winter cinematic", accent:"#9fe0ff"};
  return {key:"unknown", emoji:"❓", query:"dramatic sky", accent:"#ff8aa1"};
}

/* ---------- angry lines ---------- */
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function getLines(condKey){
  const pg = swearsOn
    ? {
        fog: [
          ["Can’t <span class='hi'>f***ing</span> see <span class='hi'>shit</span>.", "Don’t bother looking out the window."],
          ["Visibility? <span class='hi'>Nah</span>.", "It’s foggy as hell."]
        ],
        rain: [
          ["It’s raining as <span class='hi'>f***</span>.", "Everything’s wet. Gorgeous."],
          ["Sky’s having a <span class='hi'>tantrum</span>.", "Umbrella or suffer."]
        ],
        clear: [
          ["It’s <span class='hi'>bright</span> as hell.", "Sunnies on. Ego up."],
          ["Sun’s out.", "Now go pretend you love it."]
        ],
        cloud: [
          ["It’s <span class='hi'>moody</span>.", "Same energy as a Monday."],
          ["Clouds everywhere.", "Vibes: mildly annoyed."]
        ],
        snow: [
          ["Cold as <span class='hi'>f***</span>.", "Even feelings froze."],
          ["Snow.", "Cute until you step in it."]
        ],
        night: [
          ["It’s a <span class='hi'>dark</span> vibe.", "Streetlights doing their best."],
          ["Night mode.", "Try not to freeze."]
        ],
        unknown: [
          ["Weather’s <span class='hi'>confused</span>.", "Same, honestly."]
        ]
      }
    : {
        fog: [
          ["It’s <span class='hi'>foggy</span>.", "You won’t see much out there."],
        ],
        rain: [
          ["It’s <span class='hi'>raining</span>.", "Umbrella time."],
        ],
        clear: [
          ["It’s <span class='hi'>sunny</span>.", "Sunnies on."],
        ],
        cloud: [
          ["It’s <span class='hi'>cloudy</span>.", "A bit moody."],
        ],
        snow: [
          ["It’s <span class='hi'>snowing</span>.", "Stay warm."],
        ],
        night: [
          ["It’s <span class='hi'>night</span>.", "Calm vibes."],
        ],
        unknown: [
          ["Not sure what it is.", "But it exists."]
        ]
      };

  return pick(pg[condKey] || pg.unknown);
}

/* ---------- online background (no local assets) ---------- */
/*
  Unsplash "source" URL gives an image without needing an API key.
  It can be big, so we pass it through images.weserv.nl to resize to ~700px wide.
*/
function backgroundUrl(query){
  const src = `https://source.unsplash.com/featured/?${encodeURIComponent(query)}`;
  return `https://images.weserv.nl/?url=${encodeURIComponent(src.replace(/^https?:\/\//,''))}&w=700&h=700&fit=cover&q=70`;
}

/* ---------- fetch weather ---------- */
async function getWeather(lat, lon){
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,is_day`;
  const res = await fetch(url, {cache:"no-store"});
  const data = await res.json();
  return {
    t: data.current.temperature_2m,
    code: data.current.weathercode,
    isDay: data.current.is_day === 1
  };
}

/* ---------- geolocation with timeout + fallback ---------- */
function getGeoWithTimeout(ms=6000){
  return new Promise((resolve, reject)=>{
    if (!navigator.geolocation) return reject(new Error("no geolocation"));
    const t = setTimeout(()=>reject(new Error("geo timeout")), ms);

    navigator.geolocation.getCurrentPosition(
      (pos)=>{ clearTimeout(t); resolve(pos.coords); },
      (err)=>{ clearTimeout(t); reject(err); },
      { enableHighAccuracy:false, maximumAge: 10*60*1000, timeout: ms }
    );
  });
}

function getSavedCoords(){
  const lat = parseFloat(getCookie("aw_lat") || "");
  const lon = parseFloat(getCookie("aw_lon") || "");
  if (Number.isFinite(lat) && Number.isFinite(lon)) return {latitude:lat, longitude:lon};
  return null;
}

function saveCoords(lat, lon){
  setCookie("aw_lat", String(lat));
  setCookie("aw_lon", String(lon));
}

/* ---------- city -> lat/lon (Open-Meteo geocoding) ---------- */
async function geocodeCity(city){
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url, {cache:"no-store"});
  const data = await res.json();
  if (!data.results || !data.results.length) throw new Error("city not found");
  return { latitude: data.results[0].latitude, longitude: data.results[0].longitude };
}

/* ---------- render ---------- */
function setAccent(hex){ document.documentElement.style.setProperty("--accent", hex); }

function render(cond, wx){
  setAccent(cond.accent);
  wxIcon.textContent = cond.emoji;
  wxTemp.textContent = `${Math.round(wx.t)}°`;

  const [h, s] = getLines(cond.key);
  headline.innerHTML = h;
  sub.textContent = s;

  // set background
  bg.style.backgroundImage = `url("${backgroundUrl(cond.query)}")`;
}

/* ---------- actions / routing (hash-based, widget-friendly) ---------- */
function showSettings(on){
  settings.classList.toggle("hidden", !on);
}

async function refresh(){
  applySize();

  // 1) try geo quickly
  let coords = null;
  try{
    sub.textContent = "Getting location…";
    coords = await getGeoWithTimeout(6000);
    saveCoords(coords.latitude, coords.longitude);
  }catch(e){
    // 2) fallback to saved coords
    coords = getSavedCoords();
    if (!coords){
      headline.innerHTML = "Need a <span class='hi'>location</span>.";
      sub.textContent = "Open settings ⚙️ and set a city once.";
      showSettings(true);
      return;
    }
    sub.textContent = "Using saved location…";
  }

  // 3) fetch weather
  try{
    const wx = await getWeather(coords.latitude, coords.longitude);
    const cond = mapCondition(wx.code, wx.isDay);
    render(cond, wx);
  }catch(e){
    headline.innerHTML = "Weather <span class='hi'>failed</span>.";
    sub.textContent = "Network or API issue. Try refresh.";
  }
}

async function handleAction(action){
  switch(action){
    case "refresh":
      await refresh();
      break;
    case "settings":
      showSettings(true);
      break;
    case "closeSettings":
      showSettings(false);
      break;
    case "sizeUp":
      sizeIndex = Math.min(sizeIndex + 1, sizeSteps.length - 1);
      applySize();
      break;
    case "sizeDown":
      sizeIndex = Math.max(sizeIndex - 1, 0);
      applySize();
      break;
    case "toggleSwears":
      swearsOn = !swearsOn;
      setCookie("aw_swears", swearsOn ? "1" : "0");
      await refresh();
      break;
    case "setLatLon": {
      const lat = parseFloat($("lat").value);
      const lon = parseFloat($("lon").value);
      if (Number.isFinite(lat) && Number.isFinite(lon)){
        saveCoords(lat, lon);
        showSettings(false);
        await refresh();
      }else{
        sub.textContent = "Enter valid lat/lon.";
      }
      break;
    }
    case "setCity": {
      const city = ($("city").value || "").trim();
      if (!city){ sub.textContent = "Enter a city name."; break; }
      try{
        const coords = await geocodeCity(city);
        saveCoords(coords.latitude, coords.longitude);
        showSettings(false);
        await refresh();
      }catch(e){
        sub.textContent = "City not found. Try another.";
      }
      break;
    }
  }
}

function parseHash(){
  let h = window.location.hash || "";
  if (h.startsWith("#")) h = h.slice(1);
  const params = new URLSearchParams(h);
  return params.get("action");
}

(async function init(){
  applySize();

  const action = parseHash();
  if (action) await handleAction(action);

  // default load
  if (!action) await refresh();
})();
