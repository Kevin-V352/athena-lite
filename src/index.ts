/* eslint-disable @typescript-eslint/ban-ts-comment */

//* Custom Sass
import './sass/app.scss';

//* Bootstrap JS - ONLY JS MODULES
import Modal from 'bootstrap/js/dist/modal';

//* Others
import { createClient, type Photo } from 'pexels';

//* Interfaces
interface Scr {
  original: string
  large2x: string
  large: string
  medium: string
  small: string
  portrait: string
  landscape: string
  tiny: string
};

//* Utils
const byId = (id: string): HTMLElement | null => document.getElementById(id);
const removeAllChildNodes = (parent: HTMLElement): void => {

  parent.innerHTML = '';

};

//* Elements
// ? Normally I would have all the elements of the document listed in this position, however,
// ? for some reason I don't know, the selectors declared in the global scope tend to malfunction
// ? or their entries don't work.

const $mainContainer = byId('main-container') as HTMLDivElement | null;
const $bootstrapModal = new Modal((byId('exampleModal') ?? ''), {});
const $bootstrapModalContent = byId('modal-container') as HTMLDivElement | null;

//* Constants
const client = createClient(process.env.PEXELS_API_KEY ?? '');
let currentPage: number = 1;
let currentQuery: string = 'Landscape';
let lockRequests: boolean = false;
let currentResults: Photo[] = [];

//* Functions
const getImages = async (query: string = 'Landscape', page: number = 1): Promise<{ data: Photo[] | null, error: any | null }> => {

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
    alt="${alt ?? 'pexels-photo'}" 
    data-aos="zoom-in" 
    onclick="createAndOpenModal(${id})"
  />`
);

const generateGalleryRows = (images: Photo[]): void => {

  const $galleryGrid = byId('gallery-grid') as HTMLDivElement | null;

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

  $galleryGrid.innerHTML += (rowTemplate);

};

const loadGalleryRows = async (query?: string): Promise<void> => {

  if (lockRequests) return;

  const { data: photos } = await getImages(query, currentPage);

  //* Fetch error
  if (!photos) {

    lockRequests = true;
    renderSpinner(false);
    renderAlert(
      true,
      'fetch-error',
      'An error has occurred while trying to obtain the images. Please, check your internet connection and try again later'
    );
    return;

  };

  //* No results
  if (photos.length === 0 && currentPage === 1) {

    lockRequests = true;
    renderSpinner(false);
    renderAlert(
      true,
      'no-results',
      'No results...'
    );
    return;

  };

  //* No more results
  if (photos.length <= 3) {

    lockRequests = true;
    renderSpinner(false);

  };

  //* We save the results
  currentResults = [...currentResults, ...photos];

  for (let i = 0; i < photos.length; i += 3) {

    const chunk = photos.slice(i, i + 3);
    generateGalleryRows(chunk);

  };

  currentPage++;

};

const toDataURL = async (url: string): Promise<string> => {

  const blob = await fetch(url).then(async res => await res.blob());
  return URL.createObjectURL(blob);

};

const renderSpinner = (render: boolean): void => {

  if (!$mainContainer) return;

  const $spinnerExist = document.getElementById('spinner') as HTMLSpanElement | null;

  if ($spinnerExist && render) return;
  if (!$spinnerExist && !render) return;

  if (render) $mainContainer.innerHTML += '<span class="text-light loader--spinner" id="spinner">A</span>';
  else $spinnerExist?.remove();

};

const renderAlert = (render: boolean, type?: 'no-results' | 'fetch-error', message?: string): void => {

  if (!$mainContainer) return;

  const $alertDescription = byId('error-description') as HTMLSpanElement | null;
  const $errorRetryButton = byId('error-retry-button') as HTMLButtonElement | null;

  if (render && message) {

    switch (type) {

      case 'no-results':
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
        break;

      default:
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

        $mainContainer.innerHTML += (`
          <button 
            class="mb-3 button-1 button-1--gradient" 
            type="button"
            id="error-retry-button"
            onclick="retryLoadData()"
            data-aos="fade-up"
            data-aos-once="false"
          > 
            Retry
          </button>
        `);

    };

  } else {

    $alertDescription?.remove();
    $errorRetryButton?.remove();

  };

};

const initialLoad = async (): Promise<void> => {

  await loadGalleryRows(currentQuery);
  renderSpinner(true);

};

// @ts-expect-error
window.searchPhotos = async (e: SubmitEvent): Promise<void> => {

  e.preventDefault();

  const $galleryGrid = byId('gallery-grid') as HTMLDivElement | null;
  const $searchPhotoForm = byId('search-photo-form') as HTMLFormElement | null;

  if (!$galleryGrid || !$searchPhotoForm) return;

  const formData = new FormData(e.target as HTMLFormElement);
  const query = formData.get('search-photo-input') as string | null;

  if (!query || query.trim().length === 0) return;

  //* Clear
  lockRequests = false;
  currentResults = [];
  currentPage = 1;
  currentQuery = query;
  $searchPhotoForm.reset();
  removeAllChildNodes($galleryGrid);
  renderAlert(false);
  renderSpinner(true);

  //* Get and display
  await loadGalleryRows(query);

};

// @ts-expect-error
window.downloadImage = async (url: string, alt: string): Promise<void> => {

  const a = document.createElement('a');
  a.href = await toDataURL(url);
  a.download = alt;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

};

// @ts-expect-error
window.createAndOpenModal = (id: number): void => {

  if (!$bootstrapModalContent) return;

  const photoToDownload = currentResults.find((photo) => photo.id === id);

  if (photoToDownload == null) return;

  const { alt, src: { large2x, original, large, medium, small, portrait, landscape, tiny } } = photoToDownload;

  $bootstrapModalContent.innerHTML = (`
    <img src="${large2x}" alt="${alt ?? 'large2x-photo-default'}" class="image-1--aspect-ratio" />
    <div class="row gx-3">
      <div class="col-xs-12 col-sm-6 mb-3 mb-sm-0">
        <button class="button-1 button-1--outlined button-1--fluid" type="button" onclick="downloadImage('${landscape}','${alt ? `${alt} - landscape` : 'landscape-photo-default'}')">Landscape</button>
      </div>
      <div class="col-xs-12 col-sm-6">
        <button class="button-1 button-1--outlined button-1--fluid" type="button" onclick="downloadImage('${large}','${alt ? `${alt} - large` : 'large-photo-default'}')">Large</button>
      </div>
    </div>
    <div class="row gx-3">
      <div class="col-xs-12 col-sm-6 mb-3 mb-sm-0">
        <button class="button-1 button-1--outlined button-1--fluid" type="button" onclick="downloadImage('${large2x}','${alt ? `${alt} - large2x` : 'large2x-photo-default'}')">Large 2X</button>
      </div>
      <div class="col-xs-12 col-sm-6">
        <button class="button-1 button-1--outlined button-1--fluid" type="button" onclick="downloadImage('${medium}','${alt ? `${alt} - medium` : 'medium-photo-default'}')">Medium</button>
      </div>
    </div>
    <div class="row gx-3">
      <div class="col-xs-12 col-sm-6 mb-3 mb-sm-0">
        <button class="button-1 button-1--outlined button-1--fluid" type="button" onclick="downloadImage('${original}','${alt ? `${alt} - original` : 'original-photo-default'}')">Original</button>
      </div>
      <div class="col-xs-12 col-sm-6">
        <button class="button-1 button-1--outlined button-1--fluid" type="button" onclick="downloadImage('${portrait}','${alt ? `${alt} - portrait` : 'portrait-photo-default'}')">Portrait</button>
      </div>
    </div>
    <div class="row gx-3">
      <div class="col-xs-12 col-sm-6 mb-3 mb-sm-0">
        <button class="button-1 button-1--outlined button-1--fluid" type="button" onclick="downloadImage('${small}','${alt ? `${alt} - small` : 'small-photo-default'}')">Small</button>
      </div>
      <div class="col-xs-12 col-sm-6">
        <button class="button-1 button-1--outlined button-1--fluid" type="button" onclick="downloadImage('${tiny}','${alt ? `${alt} - tiny` : 'tiny-photo-default'}')">Tiny</button>
      </div>
    </div>
    <button class="button-1 button-1--gradient" type="button" data-bs-dismiss="modal">Close</button>
  `);

  $bootstrapModal.show();

};

// @ts-expect-error
window.retryLoadData = async (): void => {

  lockRequests = false;
  renderAlert(false);
  await loadGalleryRows(currentQuery);

};

//* Listeners
// eslint-disable-next-line @typescript-eslint/no-misused-promises
window.addEventListener('scroll', async (): Promise<void> => {

  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {

    await loadGalleryRows(currentQuery);

  };

});

//* Initial load
// eslint-disable-next-line @typescript-eslint/no-floating-promises
initialLoad();
