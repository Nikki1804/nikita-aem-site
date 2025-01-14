/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
import { fetchPlaceholders } from '../../scripts/aem.js';

const placeholders = await fetchPlaceholders('fr');

const {
  allCountries,
  abbreviation,
  africa,
  america,
  asia,
  australia,
  capital,
  continent,
  countries,
  europe,
  sNo,
} = placeholders;

async function createTableHeader(table) {
  const tr = document.createElement('tr');
  const sno = document.createElement('th');
  sno.appendChild(document.createTextNode(sNo));
  const conuntry = document.createElement('th');
  conuntry.appendChild(document.createTextNode(countries));
  const continenth = document.createElement('th');
  continenth.appendChild(document.createTextNode(continent));
  const capitalh = document.createElement('th');
  capitalh.appendChild(document.createTextNode(capital));
  const abbr = document.createElement('th');
  abbr.appendChild(document.createTextNode(abbreviation));
  tr.append(sno);
  tr.append(conuntry);
  tr.append(capitalh);
  tr.append(continenth);
  tr.append(abbr);
  table.append(tr);
}
async function createTableRow(table, row, i) {
  const tr = document.createElement('tr');
  const sno = document.createElement('td');
  sno.appendChild(document.createTextNode(i));
  const conuntry = document.createElement('td');
  conuntry.appendChild(document.createTextNode(row.Country));
  const continent = document.createElement('td');
  continent.appendChild(document.createTextNode(row.Capital));
  const capital = document.createElement('td');
  capital.appendChild(document.createTextNode(row.Continent));
  const abbr = document.createElement('td');
  abbr.appendChild(document.createTextNode(row.Abbreviation));
  tr.append(sno);
  tr.append(conuntry);
  tr.append(continent);
  tr.append(capital);
  tr.append(abbr);
  table.append(tr);
}

async function createSelectMap(jsonURL) {
  const optionsMap = new Map();
  const { pathname } = new URL(jsonURL);

  const resp = await fetch(pathname);
  optionsMap.set('all', allCountries);
  optionsMap.set('asia', asia);
  optionsMap.set('europe', europe);
  optionsMap.set('africa', africa);
  optionsMap.set('america', america);
  optionsMap.set('australia', australia);
  const select = document.createElement('select');
  select.id = 'region';
  select.name = 'region';
  optionsMap.forEach((val, key) => {
    const option = document.createElement('option');
    option.textContent = val;
    option.value = key;
    select.append(option);
  });

  const div = document.createElement('div');
  div.classList.add('region-select');
  div.append(select);
  return div;
}
async function createTable(jsonURL, val) {
  let pathname = null;
  if (val) {
    pathname = jsonURL;
  } else {
    pathname = new URL(jsonURL);
  }

  const resp = await fetch(pathname);
  const json = await resp.json();

  const table = document.createElement('table');
  createTableHeader(table);
  json.data.forEach((row, i) => {
    createTableRow(table, row, i + 1);
  });

  return table;
}

export default async function decorate(block) {
  const countries = block.querySelector('a[href$=".json"]');
  const parentDiv = document.createElement('div');
  parentDiv.classList.add('contries-block');

  if (countries) {
    parentDiv.append(await createSelectMap(countries.href));
    parentDiv.append(await createTable(countries.href, null));
    countries.replaceWith(parentDiv);
  }
  const dropdown = document.getElementById('region');
  dropdown.addEventListener('change', () => {
    let url = countries.href;
    if (dropdown.value != 'all') {
      url = `${countries.href}?sheet=${dropdown.value}`;
    }
    const tableE = parentDiv.querySelector(':scope > table');
    const promise = Promise.resolve(createTable(url, dropdown.value));
    promise.then((val) => {
      tableE.replaceWith(val);
    });
  });
}
