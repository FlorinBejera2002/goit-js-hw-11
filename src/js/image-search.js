import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';

const API_KEY = '38106260-22c65560723f63c5e0affa5f7';

const formElement = document.querySelector('.search-form');
const inputElement = document.querySelector('.form__input');
const galleryElement = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
const message = document.querySelector('.message');

const lightbox = new SimpleLightbox('.photo-card a');

let searchQuery;
let page = 1;
let limit = 40;
let totalPages;
let totalHits;

async function getImages() {
  const searchParams = new URLSearchParams({
    key: API_KEY,
    q: encodeURIComponent(searchQuery),
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: limit,
  });
  const url = `https://pixabay.com/api/?${searchParams}`;
  const response = await axios.get(url);

  totalHits = response.data.totalHits;
  totalPages = Math.ceil(totalHits / limit);

  return response.data.hits;
}

async function addImages() {
  const images = await getImages();
  renderImages(images);
  lightbox.refresh();

  if (page > 1) {
    smoothScroll();
  }

  if (page === totalPages) {
    loadMoreButton.classList.add('hidden');
    message.classList.remove('hidden');
    return;
  }

  if (page < totalPages && totalHits !== 0) {
    loadMoreButton.classList.remove('hidden');
  } else {
    loadMoreButton.classList.add('hidden');
  }
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function showNotification(totalHits) {
  if (totalHits === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }
  if (totalHits > 0) {
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  }
}

formElement.addEventListener('submit', onSubmit);

async function onSubmit(event) {
  event.preventDefault();
  galleryElement.innerHTML = '';
  message.classList.add('hidden');

  page = 1;
  searchQuery = inputElement.value;
  await addImages();
  showNotification(totalHits);
  inputElement.value = '';
}

function loadMoreImages() {
  page += 1;
  addImages();
}

loadMoreButton.addEventListener('click', loadMoreImages);

function renderImages(images) {
  images.forEach(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
      webformatWidth,
      webformatHeight,
    }) => {
      const cardMarkup = `
              <a href="${largeImageURL}">
                  <img class="gallery__img" src="${webformatURL}" alt="${tags}" width="${webformatWidth}" height="${webformatHeight}" loading="lazy" />
              </a>
              <div class="info">
                  <p class="info-item">
                      <b><span class="material-symbols-outlined icon-card">
                      favorite
                      </span></b>
                      <span>${likes}</span>
                  </p>
                  <p class="info-item">
                      <b><span class="material-symbols-outlined icon-card">
                      visibility
                      </span></b> 
                      <span>${views}</span>
                  </p>
                  <p class="info-item">
                      <b><span class="material-symbols-outlined icon-card">
                      comment
                      </span></b>
                      <span>${comments}</span>
                  </p>
                  <p class="info-item">
                      <b><span class="material-symbols-outlined icon-card">
                      download
                      </span></b>
                      <span>${downloads}</span>
                  </p>
              </div>`;

      const element = document.createElement('div');
      element.classList.add('photo-card');
      element.classList.add('is-loading');

      element.innerHTML = cardMarkup;
      galleryElement.appendChild(element);

      const img = element.querySelector('.gallery__img');
      imagesLoaded(img, function (instance) {
        element.classList.remove('is-loading');
        masonry.layout();
      });
    }
  );

  imagesLoaded('.gallery', () => {
    masonry.layout();
  });

  const masonry = new Masonry('.gallery', {
    itemSelector: '.photo-card',
    // columnWidth: 390,
    gutter: 15,
  });
}
