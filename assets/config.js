/** @typedef {{id: string, name: string, unit: string, price: number|null, includes: string}} Service */
/** Confirm these facts before publication. Null values must never become invented facts. */
export const company = {
  brand: 'parketipaigaldaja.ee',
  legalName: null, // TODO: kinnitatud ärinimi
  email: null, // TODO: kinnitatud e-post
  phone: null, // TODO: kinnitatud telefon
  region: null, // TODO: tegutsemispiirkond
  vatNote: null, // TODO: käibemaksu käsitlus
  materialNote: null, // TODO: materjalide hinna käsitlus
  formEndpoint: null, // TODO: oma serveri HTTPS endpoint
};
/** @type {Service[]} */
export const services = [
  { id: 'straight', name: 'Parketi paigaldus', unit: 'm²', price: null, includes: 'Laudparketi paigaldus ettevalmistatud aluspõrandale.' },
  { id: 'herringbone', name: 'Kalasabaparkett', unit: 'm²', price: null, includes: 'Mustri planeerimine ja kalasabaparketi paigaldus.' },
  { id: 'preparation', name: 'Aluspõranda ettevalmistus', unit: 'm²', price: null, includes: 'Aluspõranda seisukorra hindamine ja tööde kokkuleppimine.' },
  { id: 'skirting', name: 'Põrandaliistude paigaldus', unit: 'jm', price: null, includes: 'Liistude lõikamine ja paigaldus kokkulepitud mahus.' },
];
/** @type {Record<string, number|null>} */
export const patternPrices = { straight: null, herringbone: null, chevron: null };
