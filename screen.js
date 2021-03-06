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
];

let result = "";
for (const api of apis) {
    result += `${api}: ${eval(api)}\n`;
}

const lessThan = (feature, val) => !matchMedia(`(min-${feature}: ${val}px)`).matches;

const find = (min, max, feature) => {
    if (min === max) {
	return min;
    }
    const mid = Math.ceil((max + min)/2);
    return lessThan(feature, mid) ?
	find(min, mid - 1, feature) : find(mid, max, feature);
};

result += `device-width (media query): ${find(0, 10000, "device-width")}\n`;
result += `device-height (media query): ${find(0, 10000, "device-height")}\n`;

const resultDiv = document.getElementById("result");
resultDiv.innerText = result;


document.addEventListener("mousemove", e => {
    result += `mouseEvent.screenX: ${e.screenX}\n`;
    result += `mouseEvent.screenY: ${e.screenY}\n`;
    result += `mouseEvent.screenX - devicePixelRatio * mouseEvent.clientX: ${e.screenX - devicePixelRatio * e.clientX}\n`;
    result += `mouseEvent.screenY - devicePixelRatio * mouseEvent.clientY: ${e.screenY - devicePixelRatio * e.clientY}\n`;
    resultDiv.innerText = result;
}, { once: true} ); 
