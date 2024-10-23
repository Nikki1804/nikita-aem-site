/* eslint-disable no-use-before-define */
const rowsPerPage = 20; // Number of rows to show per page
let currentPage = 1; // Start from the first page
let jsonURL = ''; // Store the JSON URL

// Function to create table header
async function createTableHeader(table) {
  const tr = document.createElement('tr');
  const sno = document.createElement('th');
  sno.appendChild(document.createTextNode('Sl.No'));
  const nameth = document.createElement('th');
  nameth.appendChild(document.createTextNode('Name'));
  const emailth = document.createElement('th');
  emailth.appendChild(document.createTextNode('Email'));
  const ageth = document.createElement('th');
  ageth.appendChild(document.createTextNode('Age'));
  tr.append(sno);
  tr.append(nameth);
  tr.append(emailth);
  tr.append(ageth);
  table.append(tr);
}

// Function to create a row in the table
async function createTableRow(table, row, i) {
  const tr = document.createElement('tr');
  const sno = document.createElement('td');
  sno.appendChild(document.createTextNode(i));
  const nameth = document.createElement('td');
  nameth.appendChild(document.createTextNode(row.Name));
  const emailth = document.createElement('td');
  emailth.appendChild(document.createTextNode(row.Email));
  const ageth = document.createElement('td');
  ageth.appendChild(document.createTextNode(row.Age));
  tr.append(sno);
  tr.append(nameth);
  tr.append(emailth);
  tr.append(ageth);
  table.append(tr);
}

// Function to fetch and create table with pagination
async function createTable(page) {
  const offset = (page - 1) * rowsPerPage; // Calculate offset based on the current page
  const urlWithParams = `${jsonURL}?offset=${offset}&limit=${rowsPerPage}`; // Add offset and limit to the URL

  const resp = await fetch(urlWithParams);
  const json = await resp.json();

  const table = document.createElement('table');
  createTableHeader(table);

  json.data.forEach((row, i) => {
    createTableRow(table, row, offset + i + 1); // Adjust row numbering based on offset
  });

  return table;
}

// Function to create pagination controls with numbers
function createPaginationControls(totalRows) {
  const paginationDiv = document.createElement('div');
  paginationDiv.classList.add('pagination');

  const totalPages = Math.ceil(totalRows / rowsPerPage); // Calculate total pages

  // Create "Previous" button
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.disabled = currentPage === 1; // Disable if on the first page
  prevButton.addEventListener('click', () => changePage(currentPage - 1));

  paginationDiv.append(prevButton);

  // Create page number buttons
  // eslint-disable-next-line no-plusplus
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.classList.add('page-number');
    pageButton.disabled = i === currentPage; // Disable the current page number
    pageButton.addEventListener('click', () => changePage(i));

    paginationDiv.append(pageButton);
  }

  // Create "Next" button
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.disabled = currentPage === totalPages; // Disable if on the last page
  nextButton.addEventListener('click', () => changePage(currentPage + 1));

  paginationDiv.append(nextButton);

  return paginationDiv;
}

// Function to change pages and update the table content
async function changePage(newPage) {
  const totalRows = await getTotalRowCount();
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  if (newPage < 1 || newPage > totalPages) return; // Prevent going out of bounds

  currentPage = newPage;
  const table = document.querySelector('.custom-list table');
  table.innerHTML = ''; // Clear the current table rows
  const parentDiv = document.querySelector('.custom-list');

  parentDiv.innerHTML = ''; // Clear previous content
  parentDiv.append(await createTable(currentPage)); // Update table with new rows

  const paginationControls = createPaginationControls(totalRows); // Recreate pagination controls
  parentDiv.append(paginationControls); // Append pagination controls
}

// Function to fetch the total number of rows (using total from the API)
async function getTotalRowCount() {
  const resp = await fetch(jsonURL);
  const json = await resp.json();
  return json.total || 0; // Return total rows from the JSON
}

export default async function decorate(block) {
  const listItems = block.querySelector('a[href$=".json"]');
  const parentDiv = document.createElement('div');
  parentDiv.classList.add('custom-list');

  if (listItems) {
    jsonURL = listItems.href; // Store the JSON URL for reuse
    parentDiv.append(await createTable(currentPage)); // Initially display the first page
    const totalRows = await getTotalRowCount(); // Fetch total row count for pagination
    const paginationControls = createPaginationControls(totalRows); // Create pagination controls

    parentDiv.append(paginationControls); // Append pagination
    listItems.replaceWith(parentDiv); // Replace the old link with the table and pagination
  }
}
