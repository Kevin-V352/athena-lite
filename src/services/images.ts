//* Others
import { type Photo } from 'pexels';

//* APIs
import { pexelsAPI } from '../APIs';

/** @module services/images */

/**
 *  It gets a list of images based on the search term.
 *  @async
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

export {
  getImages
};
