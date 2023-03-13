//* Custom Sass
import './sass/app.scss';

//* Bootstrap JS - ONLY JS MODULES
import Modal from 'bootstrap/js/dist/modal';

//* Others
import { createClient, Photo } from 'pexels';

//* Interfaces
interface Scr {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
};

//* Utils
const byId = (id: string) => document.getElementById(id);
const removeAllChildNodes = (parent: HTMLElement): void => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  };
};

//* Elements
const $galleryGrid = byId('gallery-grid') as HTMLDivElement | null;
const $searchPhotoForm = byId('search-photo-form') as HTMLFormElement | null;
const $spinner = byId('spinner') as HTMLSpanElement | null;
const $mainContainer = byId('main-container') as HTMLDivElement | null;
const $bootstrapModal = new Modal(byId('exampleModal') || '', {});
const $bootstrapModalContent = byId('modal-container') as HTMLDivElement | null;

//* Constants
const client = createClient('xLd9FSfM3K3fk53yaaan0J1clzgFouPHjwjMrbz32XZfXfE9uIglCLeN');
let currentPage: number = 1;
let currentQuery: string = 'Abstract';
let lockRequests: boolean = false;
let currentResults: Photo[] = [];

//* Functions
const getImages = async (query: string = 'Abstract', page: number = 1): Promise<{ data: Photo[] | null; error: any | null; }> => {
  try {
    const response = await client.photos.search({ 
      query, 
      page,
      per_page: 18
    });

    if ('error' in response) return { data: null, error: response.error };

    const { photos } = response;

    return { data: photos, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error };
  };
};

const generateSinglePhoto = (src: Scr, alt: string | null, id: number): string => (
  `<img 
    src="${src.large2x}" 
    class="image-1--aspect-ratio image-1--selectable" 
    alt="${alt || 'pexels-photo'}" 
    data-aos="zoom-in" 
    onclick="createAndOpenModal(${id})"
  />`
);

const generateGalleryRows = (images: Photo[]): void => {
  if (!$galleryGrid) return;

  const options = [1, 2, 3];
  const idx = Math.floor(Math.random() * options.length);
  let rowTemplate = '';

  const [photo1, photo2, photo3] = images;

  switch (options[idx]) {
    case 1:
      rowTemplate = `
        <div class="row gx-1 mb-1">

          <div class="col-8">
            ${generateSinglePhoto(photo1.src, photo1.alt, photo1.id)}
          </div>

          <div class="col-4">
            <div class="d-flex flex-column gap-1">
              ${photo2 ? generateSinglePhoto(photo2.src, photo2.alt, photo2.id) : ''}
              ${photo3 ? generateSinglePhoto(photo3.src, photo3.alt, photo3.id) : ''}
            </div>
          </div>

        </div>
      `;
    break;

    case 2: 
      rowTemplate = `
        <div class="row gx-1 mb-1">

          <div class="col-4">
            <div class="d-flex flex-column gap-1">
              ${generateSinglePhoto(photo1.src, photo1.alt, photo1.id)}
              ${photo2 ? generateSinglePhoto(photo2.src, photo2.alt, photo2.id) : ''}
            </div>
          </div>

          <div class="col-8">
            ${photo3 ? generateSinglePhoto(photo3.src, photo3.alt, photo3.id) : ''}
          </div>

        </div>
    `;
    break;
  
    default:
      rowTemplate = `
        <div class="row mb-1 gx-1">

          <div class="col-4">
            ${generateSinglePhoto(photo1.src, photo1.alt, photo1.id)}
          </div>

          <div class="col-4">
            ${photo2 ? generateSinglePhoto(photo2.src, photo2.alt, photo2.id) : ''}
          </div>

          <div class="col-4">
            ${photo3 ? generateSinglePhoto(photo3.src, photo3.alt, photo3.id) : ''}
          </div>

        </div>
      `;
  };

  $galleryGrid.innerHTML += rowTemplate;
};

const loadGalleryRows = async (query?: string): Promise<void> => {
  if (lockRequests) return;

  const { data: photos } = await getImages(query, currentPage);

  //* Fetch error
  if (!photos) {
    exceptionHandler('An error has occurred while trying to obtain the images. Please, check your internet connection and try again later');
    lockRequests = true;
    return;
  };

  //* We save the results
  currentResults = [...currentResults, ...photos];

  //* No results
  if (photos.length === 0 && currentPage === 1) exceptionHandler('No results...');

  //* No more results
  if (photos.length <= 3) {
    lockRequests = true;
    $spinner?.remove();
  };

  for (let i = 0; i < photos.length; i += 3) {
    const chunk = photos.slice(i, i + 3);
    generateGalleryRows(chunk);
  };

  currentPage++;
};

const searchPhotos = async (e: SubmitEvent): Promise<void> => {
  e.preventDefault();
  if (!$galleryGrid) return;

  const formData = new FormData(e.target as HTMLFormElement);
  const query = formData.get('search-photo-input') as string;

  if (!query || query.trim().length === 0) return;

  //* Clear
  lockRequests = false;
  $searchPhotoForm?.reset();
  removeAllChildNodes($galleryGrid);
  currentResults = [];
  currentPage = 1;
  currentQuery = query;
  
  loadGalleryRows(query);
};

const exceptionHandler = (message: string) => {
  //TODO: resolve retry button bug
  // const $errorDescription = byId('error-description');

  if (!$mainContainer) return;

  $spinner?.remove();

  $mainContainer.innerHTML += (`
    <span 
      class="my-3 error__description"
      id="error-description"
      data-aos="fade-up"
      data-aos-once="false"
    >
      ${message}
    </span>
  `);

  //TODO: resolve retry button bug
  /* <button 
      class="mb-3 button-1" 
      type="button"
      id="error-retry-button"
      onclick="retryLoadData()"
    >
      Retry
    </button> */
  
};

async function toDataURL(url: string) {
  const blob = await fetch(url).then(res => res.blob());
  return URL.createObjectURL(blob);
};

// @ts-ignore
window.downloadImage = async (url: string, alt: string): Promise<void> => {
  const a = document.createElement("a");
  a.href = await toDataURL(url);
  a.download = alt;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// @ts-ignore
window.createAndOpenModal = (id: number): void => {
  if (!$bootstrapModalContent) return;

  const photoToDownload = currentResults.find((photo) => photo.id === id);
  
  if (!photoToDownload) return;

  const { alt, src: { large2x, original, large, medium, small, portrait, landscape, tiny  } } = photoToDownload;

  $bootstrapModalContent.innerHTML = (`
    <img src="${large2x}" alt="${alt}" class="image-1--aspect-ratio" />
    <div class="row gx-3">
      <div class="col-xs-12 col-sm-6 mb-3 mb-sm-0">
        <button class="button-1 button-1--outlined button-1--fluid" type="button" onclick="downloadImage('${landscape}','${alt}')">Landscape</button>
      </div>
      <div class="col-xs-12 col-sm-6">
        <button class="button-1 button-1--outlined button-1--fluid" type="button" onclick="downloadImage('${large}','${alt}')">Large</button>
      </div>
    </div>
    <div class="row gx-3">
      <div class="col-xs-12 col-sm-6 mb-3 mb-sm-0">
        <button class="button-1 button-1--outlined button-1--fluid" type="button" onclick="downloadImage('${large2x}','${alt}')">Large 2X</button>
      </div>
      <div class="col-xs-12 col-sm-6">
        <button class="button-1 button-1--outlined button-1--fluid" type="button" onclick="downloadImage('${medium}','${alt}')">Medium</button>
      </div>
    </div>
    <div class="row gx-3">
      <div class="col-xs-12 col-sm-6 mb-3 mb-sm-0">
        <button class="button-1 button-1--outlined button-1--fluid" type="button" onclick="downloadImage('${original}','${alt}')">Original</button>
      </div>
      <div class="col-xs-12 col-sm-6">
        <button class="button-1 button-1--outlined button-1--fluid" type="button" onclick="downloadImage('${portrait}','${alt}')">Portrait</button>
      </div>
    </div>
    <div class="row gx-3">
      <div class="col-xs-12 col-sm-6 mb-3 mb-sm-0">
        <button class="button-1 button-1--outlined button-1--fluid" type="button" onclick="downloadImage('${small}','${alt}')">Small</button>
      </div>
      <div class="col-xs-12 col-sm-6">
        <button class="button-1 button-1--outlined button-1--fluid" type="button" onclick="downloadImage('${tiny}','${alt}')">Tiny</button>
      </div>
    </div>
    <button class="button-1 button-1--gradient" type="button" data-bs-dismiss="modal">Close</button>
  `);

  $bootstrapModal.show();
};

// @ts-ignore
window.retryLoadData = (): void => {
  lockRequests = false;
  loadGalleryRows(currentQuery);
};

//* Listeners
window.addEventListener('scroll', () => {
  if(window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
    loadGalleryRows(currentQuery);
  };
});

$searchPhotoForm?.addEventListener('submit', searchPhotos);

//* Initial load
loadGalleryRows(currentQuery);