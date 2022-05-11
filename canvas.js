function save(canvas) {
  // TODO: look into: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
  return canvas.toDataURL()
}

function makeTextImage(canvas, context) {
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
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function makeBlackImage(canvas, context) {
  canvas.width = 240;
  canvas.height = 60;
  context.fillStyle = "rgba(0, 0, 0, 0)";    
  context.fillRect(0, 0, canvas.width, canvas.height);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}
