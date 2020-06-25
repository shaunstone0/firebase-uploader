# FireBase Uploader

> Upload large `.csv` files to Firebase - Built with NodeJS

## Clone or Download Repo

Once you have Cloned/Downloaded the repo, ensure that you run npm install to install needed dependencies.

**After the Dependencies have been installed you MUST run `npm link`**

this will allow you to use the CLI inside the terminal.

Create a config.js file with the following information from Firebase:

```
var firebaseConfig = {
  apiKey: 'YOUR API KEY',
  authDomain: 'YOUR AUTH DOMAIN',
  databaseURL: 'YOUR URL',
  projectId: 'PROJECT_ID',
  storageBucket: 'THE BUCKET',
  messagingSenderId: 'THIS ONE TOO FROM FIREBASE',
  appId: 'BIG `OLE LONG NUMBER',
  measurementId: 'THIS ONE TOO!',
};

export default firebaseConfig;
```

**ENSURE THAT THIS `config.js` FILE GOES INTO THE `dist` FOLDER**

## How to use:

Create inside project directory `utils`. So your file structure should have `dist` and `utils`

after running `npm link` you will only need to run one command in the terminal `csv-migrate --src path/to/.csv/file`

**Where `path/to/.csv/file` is the path on the computer where the .csv file is.**

> For example, if its in the file with the firebase uploader your command would be `csv-migrate --src test.csv`

## How it Works

after running this command, the tool with shard the .csv files into multiple files inside a `ultils` folder and it will be uploaded to the database set in the config file.
