const apis = [
  "window.screenX",
  "window.screenY",
  "window.outerWidth",
  "window.outerHeight",
  "window.outerWidth - window.innerWidth /* sidebar width */",
  "window.outerHeight - window.innerHeight /* browser chrome height */",
  "window.screen.width",
  "window.screen.height",
  "window.screen.availWidth",
  "window.screen.availHeight",
  "window.screen.availLeft",
  "window.screen.availTop /* menu bar */",
  "window.screen.height - window.screen.availHeight /* menu/task bar */",
  "window.screen.isExtended",
  "window.innerWidth",
  "window.innerHeight",
];

const media_query_apis = [
  "device-width",
  "device-height",
  "width",
  "height",
];

const mouse_apis = [
  "devicePixelRatio",
  "mouseEvent.clientX",
  "mouseEvent.clientY",
  "mouseEvent.screenX",
  "mouseEvent.screenY",
  "mouseEvent.screenX - devicePixelRatio * mouseEvent.clientX",
  "mouseEvent.screenY - devicePixelRatio * mouseEvent.clientY"
];

const resultDiv = document.getElementById("result");
const mouseResultDiv = document.getElementById("mouseResult");

const lessThan = (feature, val) => !matchMedia(`(min-${feature}: ${val}px)`).matches;

const find = (min, max, feature) => {
  if (min === max) {
    return min;
  }
  const mid = Math.ceil((max + min)/2);
  return lessThan(feature, mid) ?
    find(min, mid - 1, feature) : find(mid, max, feature);
};


const getTestValues = () => {
  let result = "";
  for (const api of apis) {
    result += `${api}: ${eval(api)}\n`;
  }
  for (const api of media_query_apis) {
    result += `${api} [media query]: ${find(0, 10000, api)}\n`;
  }
  resultDiv.innerText = result;
};

window.setInterval(getTestValues, 1000);

document.addEventListener("mousemove", mouseEvent => {
  let result = "";
  for (const api of mouse_apis) {
    result += `${api}: ${eval(api)}\n`;
  }
  mouseResultDiv.innerText = result;
});
