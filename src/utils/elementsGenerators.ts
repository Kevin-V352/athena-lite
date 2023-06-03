//* Bootstrap JS - ONLY JS MODULES
import Toast from 'bootstrap/js/dist/toast';

//* Others
import { type Photo } from 'pexels';

import { selectors } from '.';

/** @module utils/elementsGenerators */

/**
 * It generates a modal with multiple download options for an image.
 * @param {Photo} photoToDownload Object "Photo".
 */
const generateDownloadModal = (photoToDownload: Photo): string => {

  const { alt, src: { large2x, original, large, medium, small, portrait, landscape, tiny } } = photoToDownload;

  return (`
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

};

/**
 * It generates an "img" element formatted with the received arguments.
 * @param {Photo.src} src Photo link.
 * @param {string | null} alt Photo name.
 * @param {number} id Photo ID.
 * @returns {string} Returns an "img" element in string format.
 */
const generateSinglePhoto = (src: Photo['src'], alt: string | null, id: number): string => (
  `<img 
    src="${src.large2x}" 
    class="image-1--aspect-ratio image-1--selectable" 
    alt="${alt ?? 'pexels-photo'}" 
    data-aos="zoom-in" 
    onclick="openDownloadModal(${id})"
  />`
);

/**
 * It renders rows of images that are dynamically loaded into the main grid.
 * @param {Array<Photo>} images Array of objects "Photo".
 * @param {string} galleryGridId ID of the container element.
 */
const renderGalleryRows = (images: Photo[], galleryGridId: string): void => {

  const $galleryGrid = selectors.byId(galleryGridId) as HTMLDivElement | null;

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
 * It triggers the rendering of a notification.
 * @param {string} text Text message to be displayed in the notification.
 * @param {string} icon Icon class from FontAwesome.
 * @param {string} iconVariant Class for the icon variant from FontAwesome.
 * @param {HTMLDivElement | null} $bootstrapToast Modal container element (node).
 */
const renderToast = (text: string, icon: string, iconVariant: string, $bootstrapToast: HTMLDivElement | null): void => {

  if (!$bootstrapToast) return;

  $bootstrapToast.innerHTML = (`
    <i class="${iconVariant} ${icon} toast-1__type-icon"></i>
    <span class="toast-1__text">${text}</span>
  `);

  const toastBootstrap = Toast.getOrCreateInstance($bootstrapToast);
  toastBootstrap.show();

};

/**
 * It renders or removes the load spinner.
 * @param {boolean} render Boolean indicating whether the load spinner should be displayed.
 * @param {HTMLDivElement | null} $mainContainer Main content container (node).
 */
const renderSpinner = (render: boolean, $mainContainer: HTMLDivElement | null): void => {

  if (!$mainContainer) return;

  const $spinnerExist = selectors.byId('spinner') as HTMLSpanElement | null;

  if ($spinnerExist && render) return;
  if (!$spinnerExist && !render) return;

  if (render) $mainContainer.innerHTML += '<span class="text-light loader--spinner" id="spinner">A</span>';
  else $spinnerExist?.remove();

};

/**
 * It renders or removes an alert in the footer.
 * @param {HTMLDivElement | null} $mainContainer Main content container (node).
 * @param {boolean} render Boolean indicating whether the alert should be displayed.
 * @param {('no-results' | 'fetch-error')} type Type of alert to display.
 * @param {string | undefined} message Text message to be displayed in the alert.
 */
const renderAlert = (
  $mainContainer: HTMLDivElement | null,
  render: boolean,
  type?: 'no-results' | 'fetch-error',
  message?: string
): void => {

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

export {
  generateDownloadModal,
  generateSinglePhoto,
  renderGalleryRows,
  renderToast,
  renderSpinner,
  renderAlert
};
