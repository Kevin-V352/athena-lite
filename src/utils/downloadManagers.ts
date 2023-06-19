/** @module utils/downloadManagers */

/**
 * It generates a link to facilitate downloading images to the client.
 * @param {string} url Image web link.
 * @returns {Promise<Array<string, null>> | Promise<Array<null, any>>} It returns a promise containing an array with two elements, the first element will have a link to facilitate image download (promise successfully resolved) and the second an error (in case the promise fails).
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
 * It downloads an image to the client device.
 * @async
 * @param {string} url Link to the image to be saved on the client's device.
 * @param {string} alt Name of the file to be saved on the client's device.
 */
const downloadImageinClient = async (url: string, alt: string): Promise<boolean> => {

  const [photoHref] = await toDataURL(url);

  if (!photoHref) return false;

  const a = document.createElement('a');
  a.href = photoHref;
  a.download = alt;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  return true;

};

export {
  toDataURL,
  downloadImageinClient
};
