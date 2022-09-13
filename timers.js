console.log("timers");
console.log(performance.now());

const tests = [
  `performance.now()`,
];

const sleep = (t) => new Promise(resolve => window.setTimeout(resolve, t));

const awaitOneLongTask = () => new Promise(resolve => {
  const observer = new PerformanceObserver((list) => {
    const perfEntries = list.getEntries();
    perfEntries.forEach((entry) => {
      resolve(entry);
    });
  });
  observer.observe({entryTypes: ["longtask"]});
});

const generateLongTaskMeasurement = async () => {
  const entryPromise = awaitOneLongTask();
  const longTaskStart = performance.now();
  let i = 0;
  while (performance.now() - longTaskStart < 60) {
    ++i;
  }
  return await entryPromise;
};

(async () => {
  const performanceMark = performance.mark("mark1");
  await sleep(50);
  performance.measure("measure1", "mark1");
  const entries = performance.getEntries();
  console.log("entry count:", entries.length);
  for (const entry of entries) {
    console.log(entry);
    const entryKeys = Object.keys(Object.getPrototypeOf(entry));
    for (const key of entryKeys) {
      const entryVal = entry[key];
      if(!isNaN(entryVal)) {
        console.log(key, entryVal);
      }
    }
  }
  const animationFrameTime = await new Promise(resolve => requestAnimationFrame(resolve));
  console.log({animationFrameTime});
  const longTask = await generateLongTaskMeasurement();
  console.log(longTask);
})();

let result = "";
result += `${performance.now()}\n`

const resultElement = document.getElementById("result");
resultElement.innerHTML = result;
