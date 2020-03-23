const express = require('express');
const path = require('path');
const fs = require('fs');
const decomp = require('poly-decomp');
const webpack = require('webpack');
const superagent= require('superagent');
const cheerio = require('cheerio');
const Datastore = require("nedb");
const schedule = require('node-schedule');
var app = express();

// careful when you point the path of the files in index.html, starts from public folder. not root folder!!!
app.use(express.static('public'));
app.use(express.json());

// database for coronavirus
const db = new Datastore({ filename: "coronavirus.db", autoload: true });
const db_people = new Datastore({ filename: "people.db", autoload: true });

// update data at 0:0:0 everyday
function scheduleCronstyle(){
  schedule.scheduleJob('0 0 0 * * *', function(){ // second, min, hour, day, month, week
      crawlNewData();
  }); 
}

scheduleCronstyle();

// fetch data from 1point3ares website
function crawlNewData(){
  let virusTotal = [];  
  superagent.get('https://coronavirus.1point3acres.com/en').end((err, res) => {
  if (err) {
    // error
    console.log(`Cannot get coronavirus data - ${err}`)
  } else {
    //parse and get info I want
    virusTotal = getStats(res); // current new data
    let newData = virusTotal[0];
    updateData(newData);
  }
  });
  // console.log(virusTotal)
}

function updateData(newData) {
  let today_new = new Date();
  let timeStamp = today_new.getFullYear()+'-'+(today_new.getMonth()+1)+'-'+today_new.getDate();
  let doc = {"number":newData, "time":timeStamp};
  db.insert(doc,function (err, newDocs) {
    if(err) {console.log(err);}
    else{console.log(timeStamp+"'s data been updated to database");}
  });
  // console.log(newData);
}
 
// ----------- update data END -----------

// // first time to insert data in db.
// // deletes everything in the database and create db files.
// db.remove({}, { multi: true }, function (err, numRemoved) {
//   const data = getData();

//   db.insert(data.coronavirus, function(err, entries) {
//     // console.log(entries);
//   });
// });

// // get database from local server 
// function getData() {
//   const contents = fs.readFileSync(path.join(__dirname, "./data/coronavirus.json"));
//   const obj = JSON.parse(contents);
//   return obj;
// }

// get total data from database
function getData_db(cb) {
  db.find({}).sort({"number":1}).exec(function(err,docs){ //need to exec to make it work!
    cb(err,docs);
  });
}

// -------- get real-time data
let stat;
let today_stats = []; 

function crawlStats(){
  superagent.get('https://coronavirus.1point3acres.com/en').end((err, res) => {
  if (err) {
  } else {
    stat = getStats(res); 
  }
  });
}

let getStats = (res) => {  
  let $ = cheerio.load(res.text);
  if(today_stats.length >=3){
    today_stats=[];
  }
  $('strong.jsx-1633900136').each((idx, ele) => {
      if(idx < 3) today_stats.push(parseInt($(ele).text()));
    });
    // console.log(today_stats)
    return today_stats;
};

// ---------- get real-time data end-------

// ----------- people calculation
let p_people=0;
let population = 0;

function calculate(){
  let today_people = new Date();
  let date_people = today_people.getFullYear()+'-'+(today_people.getMonth()+1)+'-'+today_people.getDate();

  db_people.find({time:date_people}, function(err,docs){
    p_people = 0;
    docs.forEach(element => {
      p_people += parseInt(element.staying);
    });
    population = docs.length;
  })
}




new webpack.ProvidePlugin({ 'window.decomp': 'poly-decomp' })

app.get("/", (req, res) => {
    // crawlData();
    res.sendFile(path.join(__dirname, "views/index.html"));
  });
  
// response for today's stats
app.get("/current", (req, res) => {
  crawlStats();
  console.log(stat)
  res.json(today_stats);
});
  
// response for total stats
app.get("/getChartData", (req, res) => {
  getData_db((err, data) => {
    res.json(data);
  });
});

// response for esti
app.get("/people", (req, res) => {
  calculate();
  res.json([p_people,population]);
});

app.post("/send", (req, res) => {
  // console.log(req);
  const new_choice = {staying: req.body.staying, time:req.body.time};
  db_people.insert(new_choice, function(err, entries) {
      // console.log(entries);
      calculate();
  })
  res.json("success");
});


app.listen(8000);