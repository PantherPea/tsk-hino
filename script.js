// Get a reference to the button element using its ID
const myButton = document.getElementById('myButton');
// Get a reference to the paragraph element using its ID
const messageParagraph = document.getElementById('message');
// Get a reference to the paragraph element using its ID
const getfile = document.getElementById('getFile');

const getDatafromDrive = document.getElementById('getDatafromDrive');

function displayCSV(csvData) {
      const rows = csvData.split('\n');
      const table = document.getElementById('csvTable');
      table.innerHTML = ''; // Clear previous table content

      rows.forEach((row) => {
        const cols = row.split(',');
        const tr = document.createElement('tr');
        cols.forEach((col) => {
          const td = document.createElement('td');
          td.textContent = col.trim();
          tr.appendChild(td);
        });
        table.appendChild(tr);
      });
    }

getfile.addEventListener('change', function(event) {
    const file = event.target.files[0];
    messageParagraph.textContent = `Selected file: ${file.name}`;
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const csvData = e.target.result;
          displayCSV(csvData);
        };
        reader.readAsText(file);
      }
});

// No filepath: user decides placement


myButton.addEventListener('click', function() {
  async function pickAndReadFile() {
  // Show the file picker dialog
  const [fileHandle] = await window.showOpenFilePicker({
    types: [{
      description: 'CSV Files',
      accept: {'text/csv': ['.csv']}
    }]
  });

  // Get the File object from the handle
  const file = await fileHandle.getFile();

  // Read the file as text
  const reader = new FileReader();
  reader.onload = function(e) {
    const csvData = e.target.result;
    displayCSV(csvData); // Your existing function
  };
  reader.readAsText(file);
}
  //if (file) {
        pickAndReadFile();
  //}
});

getDatafromDrive.addEventListener('click', function() {
  async function downloadFileFromDrive(fileId, accessToken) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );
  const fileData = await response.text(); // or response.blob() for binary
  displayCSV(fileData); // Use your existing function
  }
  downloadFileFromDrive('1TH2XEV6B9y_mkrD36u7J08kQUSX6Rzrz', 'your-access-token');
});