const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
var osmtogeojson = require('osmtogeojson');
var sleep = require('sleep');
/*
TO DO QUERIES:


DRINKING WATER
BUS STOPS
TOILETS
 -
BEACH RESORTS
HISTORIC/TOURISTIC ATTRACTIONS
HOTELS
BED & BREAKFAST
RESTAURANTS
PUBS
PIZZERIAS
CAFÉS
ICE CREAM SHOPS
BARS
PHARMACIES
*/

//41.2398362341,16.1840819643,41.3974507116,16.3731154319
function getQuery(type){
    try{
        switch(type){
        case 'water':
        case 'drinking water':
            return require('./water.json');
        case 'bus':
        case 'bus stop':
            return require('./bus_stop.json');
        case 'toilet':
        case 'wc':
            return require('./toilet.json');
        case 'beach resort':
        case 'beach':
            return require('./beach_resort.json');
        case 'historic': 
        case 'monument':
            return require('./historic.json');
        case 'hotel':
            return require('./hotel.json');
        case 'bnb':
        case 'bed and breakfast':
            return require('./bnb.json');
        case 'restaurant':
            return require('./restaurant.json');
        case 'pizzeria':
        case 'pizza':
            return require('./pizzeria.json');
        case 'pub':
            return require('./pub.json');
        case 'cafe':
        case 'coffee':
            return require('./cafe.json');
        case 'icecream':
        case 'ice cream':
            return require('./icecream.json');
        case 'bar':
            return require('./bar.json');
        case 'pharmacy':
        case 'drug store':
            return require('./pharmacy.json');
        }
    }catch{
        return {error: 'file not found'};
    }
    
}

async function updateQuery(){
    try{
        let queries = [
            {name: "water", tagList: [{amenity: "drinking_water"}]},
            {name: "bus_stop", tagList: [{highway: "bus_stop"}]},
            {name: "toilet", tagList: [{amenity: "toilets"}]},
            {name: "beach_resort", tagList: [{leisure: "beach_resort"}]},
            {name: "historic", tagList: [{historic: null}, {artwork: null}, {tourism: "artwork"}]},
            {name: "hotel", tagList: [{tourism: "hotel"}]},
            {name: "bnb", tagList: [{tourism: "guest_house"}, {guest_house: "bed_and_breakfast"}]},
            {name: "restaurant", tagList: [{amenity: "restaurant"}]},
            {name: "pizzeria", tagList: [{cuisine: "pizza"},]},
            {name: "pub", tagList: [{amenity: "pub"}]},
            {name: "cafe", tagList: [{amenity: "cafe"}, {coffee: "yes"}]},
            {name: "icecream", tagList: [{amenity: "ice_cream"}]},
            {name: "bar", tagList: [{amenity: "bar"}]},
            {name: "pharmacy", tagList: [{amenity: "pharmacy"}]},
        ];
        console.info(`[ i ] Updating POI data...${0}/${queries.length}`);
        var delayTime = 5000;
        for(let current = 0; current<queries.length; current++){
            fetchQuery(queries[current].name, queries[current].tagList);
            await delay(delayTime);
            console.info(`[ i ] Updating POI data... [${current+1}/${queries.length}]\n`);
        }
    }catch(err){
        console.log(err);
    }
}

function delay(t, val) {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve(val);
        }, t);
    });
 }

function buildQuery(tagList){
    var temp = "";
    var bounds = "41.2398362341,16.1840819643,41.3974507116,16.3731154319";
    tagList.forEach(single=>{
        temp += `node${JSON.stringify(single)}(${bounds});`;
        temp += `area${JSON.stringify(single)}(${bounds});`;
    });
    return temp.replaceAll('{','[').replaceAll('}',']').replaceAll(':', "=").replaceAll("=null", "");
}

async function fetchQuery(name, tagList, errorCount){
    console.log(`Fetching ${name}...`);
    let timeout = 60;
    let tags = buildQuery(tagList);
    //let query = `http://overpass-api.de/api/interpreter?data=[out:json][timeout:${timeout}];(${tags});out%20body;%3E;`;
    //let query = `https://overpass.osm.ch/api/interpreter?data=[out:xml][timeout:${timeout}];(${tags});out%20body;out%20geom;%3E;`;
    let query   = `https://lz4.overpass-api.de/api/interpreter?data=[out:json][timeout:${timeout}];(${tags});out%20body;%3E;out%20skel%20qt;`;
    try{
        await fetch(query).then((result)=>{
        if(result.status != 200) throw 'Generic fetch error. Retrying...';
        result.json().then((resultData)=>{
            //console.log(`Result for ${query}:\n`);
            console.log(`Fetch end for ${name}.`)
            var convertedData = osmtogeojson(resultData);
            fs.writeFile(`./queries/${name}.json`, JSON.stringify(convertedData), 'utf8', function (err) {
                if (err)
                    console.error("An error occured while writing JSON Object to File.", err);
                else
                    console.log(`[OK!] ${name}.json saved.`);
                });
            })
        })
    }catch(error){
        console.log(error);
        await delay(20000);
        fetchQuery(name, tagList, errorCount + 1);
    }
    
}

module.exports = {getQuery, updateQuery};