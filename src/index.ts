//* Custom Sass
import './sass/app.scss';

//* Bootstrap JS
import * as bootstrap from 'bootstrap';

//* Others
import { createClient, Photo } from 'pexels';

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

//* Constants
const client = createClient('xLd9FSfM3K3fk53yaaan0J1clzgFouPHjwjMrbz32XZfXfE9uIglCLeN');
let currentPage: number = 1;
let currentQuery: string = 'Abstract';
let lockRequests: boolean = false;

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

const generateSinglePhoto = (url: string, alt: string | null): string => `<img src="${url}" class="image-1--aspect-ratio" alt="${alt || 'pexels-photo'}" data-aos="zoom-in">`;

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
            ${generateSinglePhoto(photo1.src.medium, photo1.alt)}
          </div>

          <div class="col-4">
            <div class="d-flex flex-column gap-1">
              ${photo2 ? generateSinglePhoto(photo2.src.medium, photo2.alt) : ''}
              ${photo3 ? generateSinglePhoto(photo3.src.medium, photo3.alt) : ''}
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
              ${generateSinglePhoto(photo1.src.medium, photo1.alt)}
              ${photo2 ? generateSinglePhoto(photo2.src.medium, photo2.alt) : ''}
            </div>
          </div>

          <div class="col-8">
            ${photo3 ? generateSinglePhoto(photo3.src.medium, photo3.alt) : ''}
          </div>

        </div>
    `;
    break;
  
    default:
      rowTemplate = `
        <div class="row mb-1 gx-1">

          <div class="col-4">
            ${generateSinglePhoto(photo1.src.medium, photo1.alt)}
          </div>

          <div class="col-4">
            ${photo2 ? generateSinglePhoto(photo2.src.medium, photo2.alt) : ''}
          </div>

          <div class="col-4">
            ${photo3 ? generateSinglePhoto(photo3.src.medium, photo3.alt) : ''}
          </div>

        </div>
      `;
  };

  $galleryGrid.innerHTML += rowTemplate;
};

const loadGalleryRows = async (query?: string): Promise<void> => {
  if (lockRequests) return;

  const { data: photos } = await getImages(query, currentPage);

  if (!photos) {
    errorHandler();
    lockRequests = true;
    return;
  };

  if (photos.length <= 3) lockRequests = true;

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
  currentPage = 1;
  currentQuery = query;
  
  loadGalleryRows(query);
};

export const errorHandler = () => {
  //TODO: resolve retry button bug
  // const $errorDescription = byId('error-description');

  if (!$mainContainer) return;

  if ($spinner) $spinner.remove();

  $mainContainer.innerHTML += (`
    <span 
      class="px-3 mb-3 error__description"
      id="error-description"
    >
      An error has occurred while trying to obtain the images. Please, check your internet connection and try again later
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

// @ts-ignore
window.retryLoadData = () => {
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