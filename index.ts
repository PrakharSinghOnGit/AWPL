// To track Time
console.time("Time Taken ");

// importing modules
const PATH = require("path");
const COLORS = require("colors");
const FILE_SYSTEM = require("fs");
const { log } = require("console");
const { MultiSelect } = require("enquirer");
const CLI_WIDTH = require("cli-width");
const POWER = require("child_process");
const PUPPETEER = require("puppeteer-extra");
const axios = require("axios");
const csvtojson = require("csvtojson");
const { PendingXHR } = require("pending-xhr-puppeteer");
const STEALTH_PLUGIN = require("puppeteer-extra-plugin-stealth");
const { Cluster } = require("puppeteer-cluster");

// assigning constants
const Setting = JSON.parse(FILE_SYSTEM.readFileSync("./Settings.json"));
const TERMINATOR = "-=".repeat(CLI_WIDTH() / 4);
const LEVELS = Setting.Miner.Levels;
const SLEEP = (duration) =>
  new Promise((resolve) => setTimeout(resolve, duration));
PUPPETEER.use(STEALTH_PLUGIN());
let wrong = "";
