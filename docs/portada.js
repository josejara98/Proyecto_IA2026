'use strict';

const cover = document.querySelector('.cover-carousel');
const slides = Array.from(cover.querySelectorAll('img'));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let currentSlide = 0;

setInterval(() => {
  if (reduceMotion.matches || document.hidden) return;
  slides[currentSlide].hidden = true;
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].hidden = false;
}, 2000);
