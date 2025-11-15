/* ----------------- helpers ----------------- */
const $ = (id)=>document.getElementById(id);
const bg = $("bg"), icon = $("wxIcon"), temp = $("wxTemp");
const headline = $("headline"), sub = $("sub");

function accentFor(key){
  // condition → accent colour
  return ({
    clear:"#ffae00",
    cloud:"#7fb4ff",
    fog:"#b88cff",
    rain:"#4cc2ff",
    snow:"#9fe0ff",
    night:"#9ad3ff",
    unknown:"#ff8aa1",
  })[key] || "#4cc2ff";
}

function phrases(key){
  const p = {
    clear: [
      ["It’s <span class='hi'>bright</span> as hell.", "Where are my sunnies?"],
      ["Sun’s out, <span class='hi'>blinding</span> everyone.", "Hydrate, champ."]
    ],
    cloud: [
      ["It’s <span class='hi'>moody</span> and grey.", "Like a Monday that won’t end."],
      ["Sky looks <span class='hi'>hungover</span>.", "Proceed with low expectations."]
    ],
    fog: [
      ["Can’t <span class='hi'>f***ing</span> see <span class='hi'>shit</span>, captain.", "Don’t bother squinting."],
      ["Fog thicker than your ex’s excuses.", "Drive like you care."]
    ],
    rain: [
      ["It’s <span class='hi'>pissing</span> down.", "Umbrella or suffer."],
      ["Wet. Cold. <span class='hi'>Shitty</span>.", "Classic."]
    ],
    snow: [
      ["Cold as <span class='hi'>f***</span>.", "Even feelings froze."],
      ["Pretty until you step in it.", "10/10 regret."]
    ],
    night: [
      ["It’s a <span class='hi'>dark</span> mood outside.", "Streetlights doing their best."],
      ["Night’s out, vibes on.", "Try not to freeze."]
    ],
    unknown: [
      ["Weather’s <span class='hi'>confused</span>.", "Same, honestly."]
    ]
  };
  const list = p[key] || p.unknown;
  return list[Math.floor(Math.random()*list.length)];
}

function setUI(key, tempC, iconChar, bgUrl){
  document.documentElement.style.setProperty("--accent", accentFor(key));
  icon.textContent = iconChar;
  temp.textContent = (tempC!=null? Math.round(tempC)+"°" : "--°");
  bg.style.backgroun
