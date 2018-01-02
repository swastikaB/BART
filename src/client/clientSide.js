import jQuery from "./jquery-3.2.1";
import  "./jquery.countdown.min.js";
import {loadMap, drawRoutesOnMap} from './map.js'

//Global variables

var map_source_lat = "";
var map_source_long = "";
var map_dest_lat = "";
var map_dest_long = "";
var $ = jQuery;


jQuery(function (){
    calculateVisitNumber();
    fetchLatestContent();
    loadMap();
    jQuery('#sourceStation').on('change', CheckSelection.bind(this, true));
    jQuery('#destStation').on('change', CheckSelection.bind(this, false));
});

/***************************************************************************
 * Function that calculates the visit number
 **************************************************************************/
function calculateVisitNumber() {
    try {
        var visitElem = document.getElementById("visitNumber");
        var visitNum = localStorage.getItem("visitNumber");
        visitNum = visitNum ? visitNum : 0;
        visitNum++;
        // visitNode = document.createElement(h5);
        visitNode = document.createTextNode(visitNum);
        visitElem.appendChild(visitNode);

        localStorage.setItem("visitNumber", visitNum);
    }
    catch (e) {

    }
}


/***************************************************************************
 * Station list related functions
 **************************************************************************/
// Refresh the content every 30 seconds
// Its like a chain reaction. In intervals fetch the source station and it will in turn call all other BART APIs
function fetchLatestContent() {
    fetchAndDisplayContent();
    var timer = setInterval(fetchAndDisplayContent, 30000);
}

function fetchAndDisplayContent() {
    var srcStn = document.getElementById("sourceSelector");
    var destStn = document.getElementById("destSelector");
    var sourceStation = 0;
    var destinationStation = 0;
    if (srcStn.options.length > 1) {
        sourceStation = srcStn.selectedIndex;
        // for (a in srcStn.options) { srcStn.options.remove(0); };
    }
    if (destStn.options.length > 1) {
        destinationStation = destStn.selectedIndex;
        //for (a in destStn.options) { destStn.options.remove(0); };
    }
    getStationJson(sourceStation, destinationStation); //get the latest list of stations.  
}

// Function that is called onload of the body and every 30 seconds
function getStationJson(sourceStation, destinationStation) {
    var selectSource = document.getElementById("sourceSelector");
    var selectDest = document.getElementById("destSelector");
    let promiseStationList = new Promise((resolve, reject) =>{
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/stations', true);
        xhr.send(null);
        xhr.onload = () => resolve(xhr);
        xhr.onerror = () => reject(xhr);
    });//Call a function when the state changes.
     promiseStationList.then((xhr) => {
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            var stations = JSON.parse(xhr.response);
            var len = stations.length;

            //delete if already exists and create new none
            deleteStationList(selectSource, selectDest);
            //create empty option
            var sourceOption = document.createElement('option');
            selectSource.appendChild(sourceOption);
            var destOption = document.createElement('option');
            selectDest.appendChild(destOption);

            for (var i = 0; i < len; i++) {
                var sourceOption = document.createElement('option');
                selectSource.appendChild(sourceOption);
                sourceOption.value = stations[i].abbr[0];
                sourceOption.innerHTML = stations[i].name[0];

                var destOption = document.createElement('option');
                selectDest.appendChild(destOption);
                destOption.value = stations[i].abbr[0];
                destOption.innerHTML = stations[i].name[0];
            }
            document.getElementById("sourceSelector").selectedIndex = sourceStation;
            document.getElementById("destSelector").selectedIndex = destinationStation;
        }
    });
    promiseStationList.catch((xhr) => console.log(xhr.status));
}

function deleteStationList(srcStn, destStn) {
    if (srcStn.options.length > 1) {
        while (srcStn.options.length != 0) { srcStn.options.remove(0); };
    }
    if (destStn.options.length > 1) {
        while (destStn.options.length != 0) { destStn.options.remove(0); };
    }
}

/***************************************************************************
 * Station selection related functions
 **************************************************************************/
// Called then the selection value changes in the dropdowns
function CheckSelection(sourceSelected) {
    var sourceStation = document.getElementById("sourceSelector").value;
    var destStation = document.getElementById("destSelector").value;
    if (!(sourceStation === "" || destStation === "")) {
        //check if table is already present
        var table = document.getElementById("tripDetailsTable");
        if (table) {
            table.innerHTML = "";
        }
        //check if source and destination are same. If yes then send error message
        if (sourceStation === destStation) {
            sourceStation.value = "";
            destStation.selectedIndex = -1;
            alert("Source and destination cannot be same");
        } else {
            getTripDetails();
        }
    }
    getStationInformation(sourceSelected);
}

function initializeTripDetailsTable() {
    var table = document.getElementById("tripDetailsTable");
    var tr = document.createElement('tr');

    var th0 = document.createElement('th');
    th0.innerHTML = "Source Departure Time";
    tr.appendChild(th0);
    var th1 = document.createElement('th');
    th1.innerHTML = "Destination Arrival Time";
    tr.appendChild(th1);
    var th2 = document.createElement('th');
    th2.innerHTML = "Cash $";
    tr.appendChild(th2);
    var th3 = document.createElement('th');
    th3.innerHTML = "Clipper $";
    tr.appendChild(th3);
    var th4 = document.createElement('th');
    th4.innerHTML = "Total Trip Time";
    tr.appendChild(th4);
    table.appendChild(tr);
}

function getTripDetails() {
    initializeTripDetailsTable();
    var sourceStation = document.getElementById("sourceSelector").value;
    var destStation = document.getElementById("destSelector").value;
    var url = "/trips?source=" + sourceStation + "&dest=" + destStation;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send(null);
    xhr.onreadystatechange = function () {//Call a function when the state changes.
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            var table = document.getElementById("tripDetailsTable");
            //get info from JSON 
            var tripInfo = JSON.parse(xhr.response);
            var len = tripInfo.trip.length;
            var timerTime;
            for (var i = 0; i < len; i++) {
                var trip = tripInfo.trip[i].$;
                var cash = trip.fare;
                var clipper = trip.clipper;
                var originTime = trip.origTimeMin;
                var destTime = trip.destTimeMin;
                var tripTime = trip.tripTime;

                //dynamically create table
                var tr = document.createElement('tr');
                var td0 = document.createElement('td');
                td0.innerHTML = originTime;
                tr.appendChild(td0);
                var td1 = document.createElement('td');
                td1.innerHTML = destTime;
                tr.appendChild(td1);
                var td2 = document.createElement('td');
                td2.innerHTML = cash;
                tr.appendChild(td2);
                var td3 = document.createElement('td');
                td3.innerHTML = clipper;
                tr.appendChild(td3);
                var td4 = document.createElement('td');
                td4.innerHTML = tripTime;
                tr.appendChild(td4);
                table.appendChild(tr);

                if (i == 1) {
                    createTimer(originTime);
                }
            }
        }
    }
}

function getStationInformation(sourceStationSelected) {
    //sourceNode is true if function is called from source station 
    //sourceNode is false if function is called from destination station 
    var station;
    if (sourceStationSelected) {
        station = document.getElementById("sourceSelector").value;
    } else {
        station = document.getElementById("destSelector").value;
    }

    //check if blank is selected
    if (station === "") {
        if (sourceStationSelected) {
            map_source_lat = "";
            map_source_long = "";
        }
        else {
            map_dest_lat = "";
            map_dest_long = "";
        }
        return;
    }

    if (sourceStationSelected) {
        var aside = document.getElementById('sourceStationInfo');
        //check if data is already present
        if (aside.hasChildNodes()) {
            aside.innerHTML = "";
        }
    }

    var url = "/station?source=" + station;
    let xhrSrcInfo = new XMLHttpRequest();
    xhrSrcInfo.open('GET', url, true);
    xhrSrcInfo.send(null);

    xhrSrcInfo.onreadystatechange = function () {//Call a function when the state changes.
        if (xhrSrcInfo.readyState == XMLHttpRequest.DONE && xhrSrcInfo.status == 200) {
            var station = JSON.parse(xhrSrcInfo.response);
            var stationInfo = station[0];
            setStationInformation(stationInfo, sourceStationSelected);
            drawRoutesOnMap(map_source_lat, map_source_long, map_dest_lat, map_dest_long);
        }
    }
}

function setStationInformation(stationInfo, sourceStationSelected) {
    //sourceNode is true if function is called from source station 
    //sourceNode is false if function is called from destination station 
    if (sourceStationSelected) {
        var divInfo = document.getElementById('sourceStationInfo');
        map_source_lat = stationInfo["gtfs_latitude"][0];
        map_source_long = stationInfo["gtfs_longitude"][0];
        for (var key in stationInfo) {
            let value = stationInfo[key];
            if (!(typeof value[0] === 'object')) {
                if (key === "name") {
                    var name = document.createElement("h3");
                    name.innerHTML = value[0];
                    divInfo.appendChild(name);
                } else {
                    var para = document.createElement('p');
                    var heading = key.replace("_", " ");
                    if (key === "link") {
                        para.innerHTML = "<strong>" + heading + ":  </strong><a rel=\"external\" href=\"" + value[0] + "\">" + value[0] + "</a>";
                    } else {
                        para.innerHTML = "<strong>" + heading + ":  </strong>" + value[0];
                    }
                    divInfo.appendChild(para)
                }
            }
        }
    }
    else {
        map_dest_lat = stationInfo["gtfs_latitude"][0];
        map_dest_long = stationInfo["gtfs_longitude"][0];
    }
}

function createTimer(originTime) {
    var timeSeperatorIndex = originTime.indexOf(":");
    var originHr = originTime.substring(0, timeSeperatorIndex);
    var typeSeparatorIndex = originTime.indexOf(" ");
    var originMin = originTime.substring(timeSeperatorIndex + 1, typeSeparatorIndex);
    var amPm = originTime.substring(typeSeparatorIndex + 1);
    if (amPm === "PM") {
        if (originHr == 12) {
            originHr = 0;
        } else {
            originHr = parseInt(originHr) + 12;
        }
    }

    var curDate = new Date();
    var originYear = curDate.getFullYear();
    var originMonth = curDate.getMonth() + 1;
    var originDay = curDate.getDate();
    originHr = originHr.length === 1 ? `0${originHr}` : originHr;
    originMin = originMin.length === 1 ? `0${originMin}` : originMin;
    var originSec = '00';

    $("#timer")
        .countdown(`${originYear}/${originMonth}/${originDay} ${originHr}:${originMin}:${originSec}`, function (event) {
            $(this).text(
                event.strftime('%H:%M:%S')
            );
        });
}

//When user selects source and destination, 
//step 1 : check if both are selected
//step 2 : call "/station" for source station and populate station Information
//step 3 : store lat and long info for source station
//step 4 : call "/station" for destination station 
//step 5 : store lat and long info for destination station
//step 6 : draw route on map 
//step 7 : populate the trip table

