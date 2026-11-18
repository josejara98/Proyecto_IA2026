'use strict';

const slides = Array.from(document.querySelectorAll('.cover-slides img'));
const controls = document.querySelector('.cover-controls');
const position = document.getElementById('cover-position');
const autoplay = document.getElementById('cover-play');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let currentSlide = 0;
let timer;

function showSlide(index) {
  slides[currentSlide].hidden = true;
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].hidden = false;
  position.textContent = (currentSlide + 1) + ' / ' + slides.length;
}

function setAutoplay(playing) {
  clearInterval(timer);
  timer = playing ? setInterval(() => showSlide(currentSlide + 1), 5500) : undefined;
  autoplay.textContent = playing ? 'Pausar' : 'Reproducir';
  position.setAttribute('aria-live', playing ? 'off' : 'polite');
}

document.getElementById('cover-prev').addEventListener('click', () => {
  setAutoplay(false);
  showSlide(currentSlide - 1);
});

document.getElementById('cover-next').addEventListener('click', () => {
  setAutoplay(false);
  showSlide(currentSlide + 1);
});

autoplay.addEventListener('click', () => setAutoplay(timer === undefined));
reduceMotion.addEventListener('change', event => {
  if (event.matches) setAutoplay(false);
});
controls.hidden = false;
setAutoplay(!reduceMotion.matches);
