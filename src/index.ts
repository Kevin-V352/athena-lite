/* eslint-disable @typescript-eslint/ban-ts-comment */

//* Custom Sass
import './sass/app.scss';

//* Bootstrap JS - ONLY JS MODULES
import Modal from 'bootstrap/js/dist/modal';

//* Others
import { type Photo } from 'pexels';

//* Services
import { images } from './services';

//* Utils
import {
  downloadManagers,
  elementsGenerators,
  nodeModifiers,
  selectors
} from './utils';

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
 * @var {number}
 * @default 1
 */
let currentPage: number = 1;

/**
 * Search term for images.
 * @var {string}
 * @default Landscape
 */
let currentQuery: string = 'Landscape';

/**
 * Boolean that indicates if the image request process should be blocked.
 * @var {boolean}
 * @default false
 */
let lockRequests: boolean = false;

/**
 * Array where the user's search results are stored.
 * @var {Array<Photo>}
 * @default []
 */
let currentResults: Photo[] = [];

//* Functions
/**
 * It triggers the action of searching for photos and loading them into the main grid.
 * @async
 * @param {string | undefined} query Search term.
 */
const loadGalleryRows = async (query?: string): Promise<void> => {

  if (lockRequests) return;

  const [photos] = await images.getImages(query, currentPage);

  //* Fetch error
  if (!photos) {

    lockRequests = true;
    elementsGenerators.renderSpinner(false, $mainContainer);
    elementsGenerators.renderAlert(
      $mainContainer,
      true,
      'fetch-error',
      'An error has occurred while trying to obtain the images. Please, check your internet connection and try again later'
    );
    return;

  };

  //* No results
  if (photos.length === 0 && currentPage === 1) {

    lockRequests = true;
    elementsGenerators.renderSpinner(false, $mainContainer);
    elementsGenerators.renderAlert(
      $mainContainer,
      true,
      'no-results',
      'No results...'
    );
    return;

  };

  //* No more results
  if (photos.length <= 3) {

    lockRequests = true;
    elementsGenerators.renderSpinner(false, $mainContainer);

  };

  //* We save the results
  currentResults = [...currentResults, ...photos];

  for (let i = 0; i < photos.length; i += 3) {

    const chunk = photos.slice(i, i + 3);
    elementsGenerators.renderGalleryRows(chunk, 'gallery-grid');

  };

  currentPage++;

};

/**
 * It triggers the initial content load.
 * @async
 */
const initialLoad = async (): Promise<void> => {

  await loadGalleryRows(currentQuery);
  elementsGenerators.renderSpinner(true, $mainContainer);

};

/**
 * It triggers image search when the user uses the search bar.
 * @async
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
  elementsGenerators.renderAlert($mainContainer, false);
  elementsGenerators.renderSpinner(true, $mainContainer);

  //* Get and display
  await loadGalleryRows(query);

};

/**
 * It downloads an image to the client device and triggers a notification if an error occurs.
 * @async
 * @param {string} url Link to the image to be saved on the client's device.
 * @param {string} alt Name of the file to be saved on the client's device.
 */
const downloadImage = async (url: string, alt: string): Promise<void> => {

  const success = await downloadManagers.downloadImageinClient(url, alt);

  if (!success) {

    elementsGenerators.renderToast(
      'An error has occurred while trying to download the image',
      'fa-triangle-exclamation',
      'fa-solid',
      $bootstrapToast
    );

  };

};

/**
 * It opens a modal to download images.
 * @param {number} id
 */
const openDownloadModal = (id: number): void => {

  if (!$bootstrapModalContent) return;

  const photoToDownload = currentResults.find((photo) => photo.id === id);

  if (photoToDownload == null) return;

  $bootstrapModalContent.innerHTML = elementsGenerators.generateDownloadModal(photoToDownload);

  $bootstrapModal.show();

};

/**
 * It continues the image download process in case the download was paused due to a connection error.
 * @async
 */
const retryLoadData = async (): Promise<void> => {

  lockRequests = false;
  elementsGenerators.renderAlert($mainContainer, false);
  await loadGalleryRows(currentQuery);

};

/**
 * It triggers the generation of new images for the main grid when the user is at a specific position on the Y-axis of the screen.
 * @async
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
window.openDownloadModal = openDownloadModal;

// @ts-expect-error
window.retryLoadData = retryLoadData;

//* Listeners
// eslint-disable-next-line @typescript-eslint/no-misused-promises
window.addEventListener('scroll', infiniteScroll);

//* Initial load
// eslint-disable-next-line @typescript-eslint/no-floating-promises
initialLoad();
