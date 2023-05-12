/* eslint-disable @typescript-eslint/ban-ts-comment */

//* Custom Sass
import './sass/app.scss';

//* Bootstrap JS - ONLY JS MODULES
import Modal from 'bootstrap/js/dist/modal';
import Toast from 'bootstrap/js/dist/toast';

//* Others
import { type Photo } from 'pexels';

//* Utils
import { nodeModifiers, selectors } from './utils';

//* APIs
import { pexelsAPI } from './APIs';

//* Elements
// ? Normally I would have all the elements of the document listed in this position, however,
// ? for some reason I don't know, the selectors declared in the global scope tend to malfunction
// ? or their entries don't work.

const $mainContainer = selectors.byId('main-container') as HTMLDivElement | null;
const $bootstrapModal = new Modal((selectors.byId('previewModal') ?? ''), {});
const $bootstrapModalContent = selectors.byId('previewModalContent') as HTMLDivElement | null;
const $bootstrapToast = selectors.byId('alertToast') as HTMLDivElement | null;

//* Globals variables
/**
 * Current page number of the images.
 * @category Global variables
 * @var {number}
 * @default 1
 */
let currentPage: number = 1;

/**
 * Search term for images.
 * @category Global variables
 * @var {string}
 * @default Landscape
 */
let currentQuery: string = 'Landscape';

/**
 * Boolean that indicates if the image request process should be blocked.
 * @category Global variables
 * @var {boolean}
 * @default false
 */
let lockRequests: boolean = false;

/**
 * Array where the user's search results are stored.
 * @category Global variables
 * @var {Array<Photo>}
 * @default []
 */
let currentResults: Photo[] = [];

//* Functions
/**
 *  Gets a list of images based on the search term.
 *  @async
 *  @category Functions
 *  @subcategory Getters
 *  @param {string} query Search term.
 *  @param {number} page Page number.
 *  @returns {Promise<Array<Array.<Photo>, null>> | Promise<Array<null, any>>} Returns an array with two elements, the first element will have a list of objects (fetched from the pexels API) and the second an error (in case the request fails).
 */
const getImages = async (query: string = 'Landscape', page: number = 1): Promise<[Photo[], null] | [null, any]> => {

  try {

    const response = await pexelsAPI.photos.search({
      query,
      page,
      per_page: 18
    });

    if ('error' in response) return [null, response.error];

    const { photos } = response;

    return [photos, null];

  } catch (error) {

    console.error(error);
    return [null, error];

  };

};

/**
 * Generates an "img" element formatted with the received arguments.
 * @category Functions
 * @param {Photo.src} src Photo link.
 * @param {strin | null} alt Photo name.
 * @param {number} id Photo ID.
 * @returns {string} Returns an "img" element in string format.
 */
const generateSinglePhoto = (src: Photo['src'], alt: string | null, id: number): string => (
  `<img 
    src="${src.large2x}" 
    class="image-1--aspect-ratio image-1--selectable" 
    alt="${alt ?? 'pexels-photo'}" 
    data-aos="zoom-in" 
    onclick="createAndOpenModal(${id})"
  />`
);

/**
 * Generates rows of images that are dynamically loaded into the main grid.
 * @category Functions
 * @param {Array<Photo>} images Array of objects "Photo".
 */
const generateGalleryRows = (images: Photo[]): void => {

  const $galleryGrid = selectors.byId('gallery-grid') as HTMLDivElement | null;

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

/**
 * Triggers the action of searching for photos and loading them into the main grid.
 * @async
 * @category Functions
 * @param {string | undefined} query Search term.
 */
const loadGalleryRows = async (query?: string): Promise<void> => {

  if (lockRequests) return;

  const [photos] = await getImages(query, currentPage);

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

/**
 * Generates a link to facilitate downloading images to the client.
 * @category Functions
 * @param {string} url Image web link.
 * @returns {Promise<Array<string, null>> | Promise<Array<null, any>>} Returns a promise containing an array with two elements, the first element will have a link to facilitate image download (promise successfully resolved) and the second an error (in case the promise fails).
 */
const toDataURL = async (url: string): Promise<[string, null] | [null, any]> => {

  try {

    const blob = await fetch(url).then(async res => await res.blob());
    return [URL.createObjectURL(blob), null];

  } catch (error) {

    console.error(error);
    return [null, error];

  };

};

/**
 * Render or remove the load spinner.
 * @category Functions
 * @param {boolean} render Boolean indicating whether the load spinner should be displayed.
 */
const renderSpinner = (render: boolean): void => {

  if (!$mainContainer) return;

  const $spinnerExist = document.getElementById('spinner') as HTMLSpanElement | null;

  if ($spinnerExist && render) return;
  if (!$spinnerExist && !render) return;

  if (render) $mainContainer.innerHTML += '<span class="text-light loader--spinner" id="spinner">A</span>';
  else $spinnerExist?.remove();

};

/**
 * Renders or removes an alert in the footer.
 * @category Functions
 * @param {boolean} render Boolean indicating whether the alert should be displayed.
 * @param {('no-results' | 'fetch-error')} type Type of alert to display.
 * @param {string | undefined} message Text message to be displayed in the alert.
 */
const renderAlert = (render: boolean, type?: 'no-results' | 'fetch-error', message?: string): void => {

  if (!$mainContainer) return;

  const $alertDescription = selectors.byId('error-description') as HTMLSpanElement | null;
  const $errorRetryButton = selectors.byId('error-retry-button') as HTMLButtonElement | null;

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

/**
 * Triggers the rendering of a notification.
 * @category Functions
 * @param {string} text Text message to be displayed in the notification.
 * @param {string} icon Icon class from FontAwesome.
 * @param {string} iconVariant Class for the icon variant from FontAwesome.
 */
const renderToast = (text: string, icon: string, iconVariant: string): void => {

  if (!$bootstrapToast) return;

  $bootstrapToast.innerHTML = (`
    <i class="${iconVariant} ${icon} toast-1__type-icon"></i>
    <span class="toast-1__text">${text}</span>
  `);

  const toastBootstrap = Toast.getOrCreateInstance($bootstrapToast);
  toastBootstrap.show();

};

/**
 * Triggers the initial content load.
 * @async
 * @category Functions
 */
const initialLoad = async (): Promise<void> => {

  await loadGalleryRows(currentQuery);
  renderSpinner(true);

};

/**
 * Triggers image search when the user uses the search bar.
 * @async
 * @category Functions
 * @param {SubmitEvent} e Form event
 */
const searchPhotos = async (e: SubmitEvent): Promise<void> => {

  e.preventDefault();

  const $galleryGrid = selectors.byId('gallery-grid') as HTMLDivElement | null;
  const $searchPhotoForm = selectors.byId('search-photo-form') as HTMLFormElement | null;

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
  nodeModifiers.removeAllChildNodes($galleryGrid);
  renderAlert(false);
  renderSpinner(true);

  //* Get and display
  await loadGalleryRows(query);

};

/**
 * Download an image to the client's device.
 * @async
 * @category Functions
 * @param {string} url Link to the image to be saved on the client's device.
 * @param {string} alt Name of the file to be saved on the client's device.
 */
const downloadImage = async (url: string, alt: string): Promise<void> => {

  const [photoHref] = await toDataURL(url);

  if (!photoHref) {

    renderToast(
      'An error has occurred while trying to download the image',
      'fa-triangle-exclamation',
      'fa-solid'
    );
    return;

  };

  const a = document.createElement('a');
  a.href = photoHref;
  a.download = alt;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

};

/**
 * Render a modal with multiple download options for an image.
 * @category Functions
 * @param {number} id
 */
const createAndOpenModal = (id: number): void => {

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

/**
 * Continues downloading images in case the download was paused due to a connection error.
 * @async
 * @category Functions
 */
const retryLoadData = async (): Promise<void> => {

  lockRequests = false;
  renderAlert(false);
  await loadGalleryRows(currentQuery);

};

/**
 * Triggers the generation of new images for the main grid when the user is at a specific position on the Y-axis of the screen.
 * @async
 * @category Functions
 */
const infiniteScroll = async (): Promise<void> => {

  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {

    await loadGalleryRows(currentQuery);

  };

};

// @ts-expect-error
window.searchPhotos = searchPhotos;

// @ts-expect-error
window.downloadImage = downloadImage;

// @ts-expect-error
window.createAndOpenModal = createAndOpenModal;

// @ts-expect-error
window.retryLoadData = retryLoadData;

//* Listeners
// eslint-disable-next-line @typescript-eslint/no-misused-promises
window.addEventListener('scroll', infiniteScroll);

//* Initial load
// eslint-disable-next-line @typescript-eslint/no-floating-promises
initialLoad();
