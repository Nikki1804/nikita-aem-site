/* eslint-disable no-plusplus */
/* eslint-disable no-use-before-define */
// let sheetdata = null;
let currentPage = 1;
const itemsPerPage = 20;
let jsonURL = '';

// Create Table Header
async function createTableHeader(table) {
  const tr = document.createElement('tr');
  const countryth = document.createElement('th');
  countryth.innerText = 'Country';
  const abbreviationth = document.createElement('th');
  abbreviationth.innerText = 'Abbreviation';
  const capitalth = document.createElement('th');
  capitalth.innerText = 'Capital City';
  const continentth = document.createElement('th');
  continentth.innerText = 'Continent';
  tr.append(countryth, abbreviationth, capitalth, continentth);
  table.append(tr);
}

async function createTableRow(table, row) {
  const tr = document.createElement('tr');
  const country = document.createElement('td');
  country.innerText = row.Country;
  const abbreviation = document.createElement('td');
  abbreviation.innerText = row.Abbreviation;
  const capital = document.createElement('td');
  capital.innerText = row['Capital City'];
  const continent = document.createElement('td');
  continent.innerText = row.Continent;
  tr.appendChild(country);
  tr.appendChild(abbreviation);
  tr.appendChild(capital);
  tr.appendChild(continent);
  table.append(tr);
}

// Function to fetch and create table with pagination
async function createTable(page) {
  const offset = (page - 1) * itemsPerPage; // Calculate offset based on the current page
  const offsetURL = `${jsonURL}?offset=${offset}&limit=${itemsPerPage}`; // Add offset and limit to the url
  // https://main--manishasite--manishamaheswarichalla.aem.live/countries.json?offset=0&limit=20

  const resp = await fetch(offsetURL);
  const jsonresp = await resp.json();

  const table = document.createElement('table');
  createTableHeader(table);

  jsonresp.data.forEach((row) => {
    createTableRow(table, row); // Adjust row numbering based on offset
  });

  return table;
}

// Create pagination
function createPaginationControls(totalRows) {
  const paginationDiv = document.createElement('div');
  paginationDiv.classList.add('pagination');

  const totalPages = Math.ceil(totalRows / itemsPerPage);

  // Create previous button
  const prevBtn = document.createElement('button');
  prevBtn.innerText = 'Previous';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', () => changePage(currentPage - 1));

  paginationDiv.append(prevBtn);

  // Create page number buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.classList.add('page-number');
    pageButton.innerText = i;
    pageButton.disabled = i === currentPage;
    pageButton.addEventListener('click', () => changePage(i));

    paginationDiv.append(pageButton);
  }

  // Create next button
  const nextBtn = document.createElement('button');
  nextBtn.innerText = 'Next';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => changePage(currentPage + 1));

  paginationDiv.append(nextBtn);

  return paginationDiv;
}

async function changePage(newPage) {
  const totalRows = await getTotalRowCount();
  const totalPages = Math.ceil(totalRows / itemsPerPage);

  if (newPage < 1 || newPage > totalPages) return; // Prevent going out of bounds

  currentPage = newPage;
  // currentPage = newPage;
  const table = document.querySelector('.custom-list table');
  table.innerHTML = ''; // Clear the current table rows
  const parentDiv = document.querySelector('.custom-list');

  parentDiv.innerHTML = ''; // Clear previous content
  parentDiv.append(await createTable(currentPage)); // Update table with new rows

  const paginationControls = createPaginationControls(totalRows); // Recreate pagination controls
  parentDiv.append(paginationControls); // Append pagination controls
}

async function getTotalRowCount() {
  const resp = await fetch(jsonURL);
  const jsonresp = await resp.json();
  return jsonresp.total || 0; // Return total rows from the JSON
}

export default async function decorate(block) {
  const listItems = block.querySelector('a[href$=".json"]');
  const parentDiv = document.createElement('div');
  parentDiv.classList.add('custom-list');

  if (listItems) {
    jsonURL = listItems.href; // Store the JSON URL for reuse
    parentDiv.append(await createTable(currentPage)); // Initially display the first page
    const totalRows = await getTotalRowCount(); // Fetch total row count for pagination
    const paginationControls = createPaginationControls(totalRows); // Create Pagination controls
    parentDiv.append(paginationControls);
    listItems.replaceWith(parentDiv);
  }
}
