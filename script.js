//How to: https://developers.google.com/workspace/drive/api/quickstart/js
//Link to console: https://console.cloud.google.com/apis/credentials?authuser=2&project=tsk-hino&supportedpurview=project
//Google Drive API Key: AIzaSyD1nY8vX5b2r3H4j5k6l7m8n9o0pqrstuvwxyz
//Google Drive Client ID: 1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
//API Key: AIzaSyDgcyC-ZYeqN-v_4sEqWQDKGrKN7Umc_os

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

//Google Drive API
/* exported gapiLoaded */
      /* exported gisLoaded */
      /* exported handleAuthClick */
      /* exported handleSignoutClick */

      // TODO(developer): Set to client ID and API key from the Developer Console
      const CLIENT_ID = '832642562657-ufas57nq6kfr6v1g6samfclcado58db8.apps.googleusercontent.com';
      const API_KEY = 'AIzaSyDgcyC-ZYeqN-v_4sEqWQDKGrKN7Umc_os';

      // Discovery doc URL for APIs used by the quickstart
      const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

      // Authorization scopes required by the API; multiple scopes can be
      // included, separated by spaces.
      const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

      let tokenClient;
      let gapiInited = false;
      let gisInited = false;

      document.getElementById('authorize_button').style.visibility = 'hidden';
      document.getElementById('signout_button').style.visibility = 'hidden';

      /**
       * Callback after api.js is loaded.
       */
      function gapiLoaded() {
        gapi.load('client', initializeGapiClient);
      }

      /**
       * Callback after the API client is loaded. Loads the
       * discovery doc to initialize the API.
       */
      async function initializeGapiClient() {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        maybeEnableButtons();
      }

      /**
       * Callback after Google Identity Services are loaded.
       */
      function gisLoaded() {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: '', // defined later
        });
        gisInited = true;
        maybeEnableButtons();
      }

      /**
       * Enables user interaction after all libraries are loaded.
       */
      function maybeEnableButtons() {
        if (gapiInited && gisInited) {
          document.getElementById('authorize_button').style.visibility = 'visible';
        }
      }

      /**
       *  Sign in the user upon button click.
       */
      function handleAuthClick() {
        tokenClient.callback = async (resp) => {
          if (resp.error !== undefined) {
            throw (resp);
          }
          document.getElementById('signout_button').style.visibility = 'visible';
          document.getElementById('authorize_button').innerText = 'Refresh';
          await listFiles();
        };

        if (gapi.client.getToken() === null) {
          // Prompt the user to select a Google Account and ask for consent to share their data
          // when establishing a new session.
          tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
          // Skip display of account chooser and consent dialog for an existing session.
          tokenClient.requestAccessToken({prompt: ''});
        }
      }

      /**
       *  Sign out the user upon button click.
       */
      function handleSignoutClick() {
        const token = gapi.client.getToken();
        if (token !== null) {
          google.accounts.oauth2.revoke(token.access_token);
          gapi.client.setToken('');
          document.getElementById('content').innerText = '';
          document.getElementById('authorize_button').innerText = 'Authorize';
          document.getElementById('signout_button').style.visibility = 'hidden';
        }
      }

      /**
       * Print metadata for first 10 files.
       */
      async function listFiles() {
        let response;
        try {
          response = await gapi.client.drive.files.list({
            'pageSize': 10,
            'fields': 'files(id, name)',
          });
        } catch (err) {
          document.getElementById('content').innerText = err.message;
          return;
        }
        const files = response.result.files;
        if (!files || files.length == 0) {
          document.getElementById('content').innerText = 'No files found.';
          return;
        }
        // Flatten to string to display
        const output = files.reduce(
            (str, file) => `${str}${file.name} (${file.id})\n`,
            'Files:\n');
        document.getElementById('content').innerText = output;
      }