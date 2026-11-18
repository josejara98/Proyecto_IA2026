'use strict';

const cover = document.querySelector('.cover-carousel');
const slides = Array.from(cover.querySelectorAll('img'));
let currentSlide = 0;

setInterval(() => {
  if (document.hidden) return;
  slides[currentSlide].hidden = true;
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].hidden = false;
}, 2000);
