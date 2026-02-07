document.body.style.cursor="crosshair";

document.addEventListener("click", function handler(e){
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 1;
  canvas.height = 1;

  ctx.drawImage(window.document.documentElement, e.clientX, e.clientY, 1,1,0,0,1,1);

  const data = ctx.getImageData(0,0,1,1).data;
  const r=data[0], g=data[1], b=data[2];
  const hex = "#" + [r,g,b].map(x=>x.toString(16).padStart(2,"0")).join("");

  chrome.runtime.sendMessage({
    color:{hex,r,g,b}
  });

  document.body.style.cursor="default";
  document.removeEventListener("click",handler);
});
