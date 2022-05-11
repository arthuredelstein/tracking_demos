// Borrowed from https://github.com/fingerprintjs/fingerprintjs/blob/0de85e6035ee6160fab7a4a4b8e1d19f03450b45/src/sources/canvas.ts#L48
const drawTextImage = (canvas, context) => {
  // Resizing the canvas cleans it
  canvas.width = 240
  canvas.height = 60

  context.textBaseline = 'alphabetic'
  context.fillStyle = '#f60'
  context.fillRect(100, 1, 62, 20)

  context.fillStyle = '#069'
  // It's important to use explicit built-in fonts in order to exclude the affect of font preferences
  // (there is a separate entropy source for them).
  context.font = '11pt "Times New Roman"'
  // The choice of emojis has a gigantic impact on rendering performance (especially in FF).
  // Some newer emojis cause it to slow down 50-200 times.
  // There must be no text to the right of the emoji, see https://github.com/fingerprintjs/fingerprintjs/issues/574
  // A bare emoji shouldn't be used because the canvas will change depending on the script encoding:
  // https://github.com/fingerprintjs/fingerprintjs/issues/66
  // Escape sequence shouldn't be used too because Terser will turn it into a bare unicode.
  const printedText = `Cwm fjordbank gly ${String.fromCharCode(55357, 56835) /* 😃 */}`
  context.fillText(printedText, 2, 15)
  context.fillStyle = 'rgba(102, 204, 0, 0.2)'
  context.font = '18pt Arial'
  context.fillText(printedText, 4, 45)
};

// Borrowed from https://github.com/fingerprintjs/fingerprintjs/blob/0de85e6035ee6160fab7a4a4b8e1d19f03450b45/src/sources/canvas.ts#L76
const drawGeometryImage = (canvas, context) => {
  // Resizing the canvas cleans it
  canvas.width = 122
  canvas.height = 110

  // Canvas blending
  // https://web.archive.org/web/20170826194121/http://blogs.adobe.com/webplatform/2013/01/28/blending-features-in-canvas/
  // http://jsfiddle.net/NDYV8/16/
  context.globalCompositeOperation = 'multiply'
  for (const [color, x, y] of [
    ['#f2f', 40, 40],
    ['#2ff', 80, 40],
    ['#ff2', 60, 80],
  ]) {
    context.fillStyle = color
    context.beginPath()
    context.arc(x, y, 40, 0, Math.PI * 2, true)
    context.closePath()
    context.fill()
  }
  // Canvas winding
  // https://web.archive.org/web/20130913061632/http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
  // http://jsfiddle.net/NDYV8/19/
  context.fillStyle = '#f9c'
  context.arc(60, 60, 60, 0, Math.PI * 2, true)
  context.arc(60, 60, 20, 0, Math.PI * 2, true)
  context.fill('evenodd')
};

const drawPixel = (context, x, y, color) => {
  context.fillStyle = color;
  context.fillRect(x, y, 1, 1);
};

const drawPixels = (canvas, context, pixels) => {
  canvas.width = 240;
  canvas.height = 60;
  const imgData = new ImageData(pixels, canvas.width, canvas.height);
  context.putImageData(imgData, 0, 0);
  return save(canvas);
};

const sha256hex = async (data) => {
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return Array.prototype.map.call(
    new Uint8Array(digest),
    x => (('00'+x.toString(16)).slice(-2))
  ).join('');
};

const allEqual = arr => arr.every(val => val === arr[0]);

const median = (arr) => {
  arr.sort((a,b) => a - b);
  const middleIndex = Math.floor(arr.length / 2);
  if (arr.length % 2 === 1) {
    return arr[middleIndex];
  } else {
    return (arr[middleIndex-1] + arr[middleIndex]) / 2;
  }
};

const getImageDataArray = (canvas, context) => {
  return context.getImageData(0, 0, canvas.width, canvas.height).data;
};

var raw_global;

const getRawImageHex = async (wrapper, drawFunction) => {
  const canvas = wrapper.appendChild(document.createElement("canvas"));
  const context = canvas.getContext("2d");
  drawFunction(canvas, context);
  let imageData = getImageDataArray(canvas, context);
  raw_global = imageData;
  const hexData = await sha256hex(imageData);
  return hexData;
};

const perturbedImages = async (wrapper, drawFunction, n) => {
  let images = [];
  for (let i = 0; i < n; ++i) {
    const canvas = wrapper.appendChild(document.createElement("canvas"));
    const context = canvas.getContext("2d");
    drawFunction(canvas, context);
    const value = Math.floor(Math.random() * 256);
    drawPixel(context, 0, i, `rgba(${value}, 0, 0, 1)`);
    const dataArray = getImageDataArray(canvas, context);
    images.push(dataArray);
  }
  return images;
};

const medianImage = (images) => {
  const n = images[0].length;
  const result = new Uint8ClampedArray(n);
  for (let i = 0; i < n; ++i) {
    const pixelValues = images.map(image => image[i]);
    if (allEqual(pixelValues)) {
      result[i] = pixelValues[0];
    } else {
      result[i] = median(pixelValues);
    }
  }
  return result;
};

const getMedianImageHex = async (wrapper, drawFunction) => {
  const images = await perturbedImages(wrapper, drawFunction, 15);
  const result = medianImage(images);
  const n = result.length;
  let count = 0;
  for (let i = 0; i < n; ++i) {
    if (raw_global[i] !== result[i]) {
      ++count;
    }
  }
  console.log({images, result});
  const imageHexes = await Promise.all(images.map(sha256hex));
  const resultHex = await sha256hex(result);
  console.log({imageHexes, resultHex});
  return resultHex;
};
