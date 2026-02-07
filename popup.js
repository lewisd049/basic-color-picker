const pickBtn = document.getElementById("pick");
const saveBtn = document.getElementById("saveBtn");
const preview = document.getElementById("preview");
const values = document.getElementById("values");
const recentDiv = document.getElementById("recent");
const savedDiv = document.getElementById("saved");

let currentColor = null;

// Load storage
chrome.storage.sync.get(["recent","saved"], data=>{
  if(!data.recent) chrome.storage.sync.set({recent:[]});
  if(!data.saved) chrome.storage.sync.set({saved:[]});
  render();
});

// Convert HEX to RGB
function hexToRgb(hex){
  const r = parseInt(hex.substring(1,3),16);
  const g = parseInt(hex.substring(3,5),16);
  const b = parseInt(hex.substring(5,7),16);
  return {r,g,b};
}

// Pick Color
pickBtn.onclick = async ()=>{
  if(!window.EyeDropper){
    alert("Your browser does not support EyeDropper.");
    return;
  }

  const eye = new EyeDropper();
  const result = await eye.open();

  const rgb = hexToRgb(result.sRGBHex);
  const color = {
    hex: result.sRGBHex,
    r: rgb.r,
    g: rgb.g,
    b: rgb.b
  };

  currentColor = color;
  preview.style.background = color.hex;
  values.innerText = `${color.hex} | rgb(${color.r},${color.g},${color.b})`;

  chrome.storage.sync.get("recent", data=>{
    let recent = data.recent || [];
    recent.unshift(color);
    recent = recent.slice(0,6);
    chrome.storage.sync.set({recent});
    render();
  });
};

// Save Color
saveBtn.onclick = ()=>{
  if(!currentColor) return;

  chrome.storage.sync.get("saved", data=>{
    let saved = data.saved || [];
    if(saved.length >= 32){
      alert("Saved colors full (32 max)");
      return;
    }
    saved.push(currentColor);
    chrome.storage.sync.set({saved});
    render();
  });
};

// Render Swatches
function render(){
  chrome.storage.sync.get(["recent","saved"], data=>{
    recentDiv.innerHTML="";
    savedDiv.innerHTML="";

    (data.recent||[]).forEach(c=>createSwatch(c,recentDiv));
    (data.saved||[]).forEach(c=>createSwatch(c,savedDiv));
  });
}

function createSwatch(color,parent){
  const d = document.createElement("div");
  d.className="swatch";
  d.style.background=color.hex;
  d.onclick=()=>{
    currentColor=color;
    preview.style.background=color.hex;
    values.innerText=`${color.hex} | rgb(${color.r},${color.g},${color.b})`;
  }
  parent.appendChild(d);
}
