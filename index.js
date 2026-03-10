console.clear();

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath as url } from "url";

const __dirname = dirname(url(import.meta.url));
const HISTORY_DIR = join(__dirname, "history");
const ACCOUNT_FILE = join(__dirname, "accounts.json");

!existsSync(HISTORY_DIR) ? mkdirSync(HISTORY_DIR) : "";

function generateId(
  length = 50,
  characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
) {
  return Array.from(
    { length },
    () => characters[Math.abs(Math.floor(Math.random() * characters.length))],
  ).join("");
}

function makeAccount(name) {
  // account class
  class Account {
    constructor(name) {
      this._id = generateId();
      this.username = name;
      this.balance = 0;
    }
  }
  // history class
  class History {
    constructor(method, amount) {
      this.method = method;
      this.amount = amount;
      this.time = `${new Date()}`;
    }
  }
  // save list
  function saveAccountList(list) {
    writeFileSync(ACCOUNT_FILE, JSON.stringify(list));
  }
  // save history
  function saveHistory(name, history) {
    writeFileSync(`${join(HISTORY_DIR, name)}.json`, JSON.stringify(history));
  }
  function loadHistory(name) {
    if (existsSync(`${join(HISTORY_DIR, name)}.json`)) {
      try {
        return JSON.parse(readFileSync(`${join(HISTORY_DIR, name)}.json`));
      } catch {
        return [];
      }
    } else {
      return [];
    }
  }
  // get list
  function getAccountList() {
    if (existsSync(ACCOUNT_FILE)) {
      try {
        return JSON.parse(readFileSync(ACCOUNT_FILE));
      } catch {
        return [];
      }
    } else {
      return [];
    }
  }

  let account, history;
  const accountList = getAccountList();
  account = accountList.find(
    (targetAccount) => targetAccount["username"] == name,
  );
  const isInList = account ? true : false;

  if (!isInList) {
    account = new Account(name);
    history = [];
    accountList.push(account);
    saveAccountList(accountList);
    saveHistory(account["_id"], history);
  } else {
    history = loadHistory(account["_id"]);
  }

  return {
    deposite: function (amount) {
      if (amount <= 0 || amount > 1000000) {
        return console.log(
          "ERR. Invalid amount. Please Enter amount from range 1-1000000 (up to million)",
        );
      }
      account["balance"] += amount;
      console.log("Deposite:\tRs.", amount, "\t[success]");
      history.push(new History("deposite", amount));
      saveAccountList(accountList);
      saveHistory(account["_id"], history)
    },
    withdraw: function (amount) {
      if (amount > 1000000) {
        return console.log(
          "ERR. Invalid amount. Please Enter amount from range 1-1000000 (up to million)",
        );
      }
      if (amount > account["balance"]) {
        return console.log(
          `ERR. Insufficient Balance. Current Balance:\tRs.`,
          account["balance"],
        );
      }
      account["balance"] -= amount;
      console.log("Withdrew:\tRs.", amount, "\t[success]");
      history.push(new History("withdraw", amount));
      saveAccountList(accountList);
      saveHistory(account["_id"], history)
    },
    getBalance: function () {
      console.log("Balance:\tRs.", account["balance"]);
    },
    getHistory: function () {
      console.log("History:");
      if (history.length === 0) {
        history.push({
          method: "",
          amount: "",
          time: "",
        });
      }
      console.table(history);
    },
  };
}


