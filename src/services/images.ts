/* eslint-disable @typescript-eslint/key-spacing */
//* Interfaces
import { type Photo, type PhotosResponse } from '../interfaces';

//* APIs
import { pexelsAPI } from '../APIs';

/** @module services/images */

/**
 *  It gets a list of images based on the search term.
 *  @async
 *  @param {string} query Search term.
 *  @param {number} page Page number.
 *  @returns {Promise<Array<Array.<Photo>, null>> | Promise<Array<null, any>>} It returns an array with two elements, the first element will have a list of objects (fetched from the pexels API) and the second an error (in case the request fails).
 */
const getImages = async (query: string = 'Landscape', page: number = 1): Promise<[Photo[], null] | [null, any]> => {

  try {

    const requestOptions = {
      method:  'GET',
      headers: pexelsAPI.headers
    };

    const response = await fetch(`${pexelsAPI.baseUrl}/search?query=${query}&page=${page}&per_page=18`, requestOptions);

    if (!response.ok) throw new Error('Error en la petición');

    const { photos }: PhotosResponse = await response.json();

    return [photos, null];

  } catch (error) {

    console.error(error);
    return [null, error];

  };

};

export {
  getImages
};
