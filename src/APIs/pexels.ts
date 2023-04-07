import { createClient } from 'pexels';

const client = createClient(process.env.PEXELS_API_KEY ?? '');

export default client;
