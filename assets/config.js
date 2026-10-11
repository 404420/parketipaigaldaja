/** @typedef {{id: string, name: string, unit: string, price: number|null, includes: string}} Service */
/** Confirm these facts before publication. Null values must never become invented facts. */
export const company = {
  brand: 'parketipaigaldaja.ee',
  legalName: 'RK Meistrid OÜ',
  email: 'info@renoveerikodu.ee',
  phone: '+372 5551 5783',
  region: 'Tallinn ja Harjumaa',
  vatNote: 'Hinnad on töö alghinnad. Käibemaksu kohaldumine täpsustatakse pakkumises.'
  materialNote: 'Materjalid ja aluspõranda ettevalmistus hinnastatakse eraldi, kui pole teisiti kokku lepitud.'
  formEndpoint: 'https://www.renoveerikodu.ee/api/parketi-contact.php',
};
/** @type {Service[]} */
export const services = [
  { id: 'straight', name: 'Laudparketi paigaldus', unit: 'm²', price: 12, includes: 'Parketi paigaldus ettevalmistatud aluspõrandale.' },
  { id: 'floating', name: 'Parketi paigaldus ujuvalt', unit: 'm²', price: 13, includes: 'Ujuvpaigaldus koos nõutud paisumisvuukidega.' },
  { id: 'herringbone', name: 'Kalasabaparketi paigaldus liimimisega', unit: 'm²', price: 25, includes: 'Mustri planeerimine ja liimitava kalasabaparketi paigaldus.' },
  { id: 'laminate', name: 'Laminaatparketi paigaldus', unit: 'm²', price: 13, includes: 'Laminaadi paigaldus sobivale aluspõrandale.' },
  { id: 'skirting', name: 'Põrandaliistu paigaldus', unit: 'jm', price: 5, includes: 'Liistude mõõtmine, lõikamine ja paigaldus.' },
];
/** @type {Record<string, number|null>} */
export const patternPrices = { straight: null, herringbone: null, chevron: null };
