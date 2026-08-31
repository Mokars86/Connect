import { ALL_COUNTRY_CODES, getCountryOptionsHTML } from '../src/utils/countryCodes.js';

console.log('Total countries in list:', ALL_COUNTRY_CODES.length);
const html = getCountryOptionsHTML('+233');
console.log('Sample HTML options includes Ghana:', html.includes('Ghana'));
console.log('Sample HTML options includes US:', html.includes('United States'));
console.log('Test completed successfully!');
