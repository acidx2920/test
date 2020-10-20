export function convertTime(isoDate) {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).substr(-2);
  const day = date.getDate();
  const hours = ('0' + date.getHours()).substr(-2);
  const minutes = ('0' + date.getMinutes()).substr(-2);

  return {
    formatted: `${day}.${month}.${year} at ${hours}:${minutes}`,
    datetime: `${year}-${month}-${day} ${hours}:${minutes}`
  }
}

export function buildElement(tag, text, classes) {
  const element = document.createElement(tag);
  if (text) {
    element.textContent = text;
  }
  if (classes) {
    element.className = classes;
  }
  return element;
}
