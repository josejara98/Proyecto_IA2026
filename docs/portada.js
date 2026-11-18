'use strict';

for (const carousel of document.querySelectorAll('[data-carousel]')) {
  const slides = Array.from(carousel.querySelectorAll('[data-slide]'));
  const controls = carousel.querySelector('.slide-controls');
  const position = controls.querySelector('[data-slide-position]');
  let current = 0;

  for (const button of controls.querySelectorAll('[data-slide-step]')) {
    button.addEventListener('click', () => {
      slides[current].hidden = true;
      current = (current + Number(button.dataset.slideStep) + slides.length) % slides.length;
      slides[current].hidden = false;
      position.textContent = (current + 1) + ' / ' + slides.length;
    });
  }
  controls.hidden = false;
}
