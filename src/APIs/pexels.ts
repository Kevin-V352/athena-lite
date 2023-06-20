interface PexelsClientConfig {
  baseUrl: string
  headers: Headers
};

const headers = new Headers();
headers.append('Authorization', process.env.PEXELS_API_KEY ?? '');
headers.append('Accept', 'application/json');
headers.append('Content-Type', 'application/json');

const clientConfig: PexelsClientConfig = {
  baseUrl: 'https://api.pexels.com/v1',
  headers
};

export default clientConfig;
