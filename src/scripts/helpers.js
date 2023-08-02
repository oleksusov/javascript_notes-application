export function createButton(text, className, clickHandler) {
  const button = document.createElement('button');

  button.textContent = text;
  button.classList.add('button', className);
  button.addEventListener('click', clickHandler);

  return button;
}
