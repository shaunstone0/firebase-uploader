#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const csvtojson_1 = __importDefault(require("csvtojson"));
const commander_1 = __importDefault(require("commander"));
const fs = __importStar(require("fs"));
const firebase = __importStar(require("firebase"));
const config_1 = __importDefault(require("./config"));
const ShardingToCsv = require('sharding-to-csv').ShardingToCsv;
const filehound = require('filehound');
// Set up Arguments in Command Line
commander_1.default
    .version('1.0.0')
    .option('-s, --src <path>', 'Path to .csv file')
    .parse(process.argv);
// Initialize Firebase Config
firebase.initializeApp(config_1.default);
// Set DB for Referenced to firebase database
const db = firebase.database();
// If No DB Connection- let me know.
if (!db) {
    console.log('No Database Detected');
}
// Because the .CSV file is to large to parse and upload, break it into 10 different pieces.
const shardFiles = () => {
    // Set a Variable for the source path that the user inputs in
    const srcPath = commander_1.default.src;
    // If no source path is entered, give this error message
    if (!srcPath) {
        console.log('Please provide valid path to .csv File');
    }
    // a Promise!
    return new Promise((resolve, reject) => {
        console.log('starting sharding process....');
        // Shard Larger .csv Files to Smaller versions for Firebase upload
        var sharding = new ShardingToCsv(srcPath, {
            encoding: 'iso-8859-1',
            maxFileSize: 1000000,
        }).shard();
        sharding.on('error', (err) => console.log(err), reject);
        sharding.on('completed', () => {
            console.log('Done Sharding, not to be confused with sharting!');
            // resolve promise
            resolve(sharding);
        });
    });
};
const fromDir = async () => {
    // Await the sharding of the files
    await shardFiles();
    // Actions to create .json files for each shard.
    // variable for shard directory
    // Change this Directory per your application
    const dir = './utils';
    // Read Shard Directory
    const files = fs.readdirSync(dir);
    // Interate over the Files
    for (const file of files) {
        const rawData = file;
        try {
            // Parse .csv shards into json files using csvtojson
            await csvtojson_1.default()
                .fromFile(`utils/${rawData}`)
                .then((data) => {
                fs.writeFile(`./utils/${file}.json`, JSON.stringify(data, null, 4), (err) => {
                    if (err) {
                        throw err;
                    }
                    console.log(`created json file with ${file} name`);
                });
            });
        }
        catch (err) {
            console.log(err);
        }
    }
};
// New Function to upload to database
const uploadToDatabase = async () => {
    // await creation of .json files
    await fromDir();
    filehound
        .create()
        .paths('./utils')
        .ext('.json')
        .find((err, jsonFiles) => {
        if (err) {
            return console.log(err);
        }
        const readFile = jsonFiles.map((jsonFile) => {
            const dbItem = jsonFile;
            const item = fs.readFileSync(dbItem);
            const parsedItem = JSON.parse(item);
            // console.log(parsedItem);
            firebase.database().ref('funds').set({ parsedItem });
            console.log('uploaded to database!');
        });
    });
};
uploadToDatabase();
