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

// Pick color
pickBtn.onclick = async ()=>{
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  chrome.scripting.executeScript({
    target:{tabId:tab.id},
    files:["content.js"]
  });
};

// Receive picked color
chrome.runtime.onMessage.addListener((msg)=>{
  if(msg.color){
    currentColor = msg.color;
    preview.style.background = msg.color.hex;
    values.innerText = `${msg.color.hex} | rgb(${msg.color.r},${msg.color.g},${msg.color.b})`;

    chrome.storage.sync.get("recent", data=>{
      let recent = data.recent || [];
      recent.unshift(msg.color);
      recent = recent.slice(0,6);
      chrome.storage.sync.set({recent});
      render();
    });
  }
});

// Save color
saveBtn.onclick = ()=>{
  if(!currentColor) return;

  chrome.storage.sync.get("saved", data=>{
    let saved = data.saved || [];
    if(saved.length >= 32) return alert("Saved colors full!");
    saved.push(currentColor);
    chrome.storage.sync.set({saved});
    render();
  });
};

// Render swatches
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
    preview.style.background=color.hex;
    values.innerText=`${color.hex} | rgb(${color.r},${color.g},${color.b})`;
    currentColor=color;
  }
  parent.appendChild(d);
}
