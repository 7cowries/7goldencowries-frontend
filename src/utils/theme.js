export function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  document.body.classList.toggle('theme-yolo-pop', savedTheme ? savedTheme === 'yolo' : true);
}

export function toggleTheme() {
  const isYolo = document.body.classList.toggle('theme-yolo-pop');
  localStorage.setItem('theme', isYolo ? 'yolo' : 'deep');
}
