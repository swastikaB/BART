
/***************************************************************************
 * Google map related functions
 **************************************************************************/

var date_for_map;
const myGoogleKey = "AIzaSyA4sFNYK75iVD02BoCKbEahey-4lLpm3SY";
var map;
var directionsDisplay;



function InitializeMapCallback() {
    var latlng = new google.maps.LatLng(37.7831, -122.4039);
    directionsDisplay = new google.maps.DirectionsRenderer();
    var myOptions = {
        zoom: 10,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map"), myOptions);
    directionsDisplay.setMap(map);
}
window["InitializeMapCallback"] = InitializeMapCallback;

export function loadMap() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + myGoogleKey + "&callback=InitializeMapCallback";
    //script.src = "https://maps.googleapis.com/maps/api/js?key="+myKey +"&sensor=false";
    document.body.appendChild(script);
}

export function drawRoutesOnMap(map_source_lat, map_source_long, map_dest_lat, map_dest_long) {
    var selectedMode = "TRANSIT";
    if (map_source_lat && map_source_long && map_dest_lat && map_dest_long) {


        //let coords = results.features[i].geometry.coordinates;
        let sourcelatLng = new google.maps.LatLng(map_source_lat, map_source_long);
        let destlatLng = new google.maps.LatLng(map_dest_lat, map_dest_long);
        /*let markerSrc = new google.maps.Marker({
            position: sourcelatLng,
            map: map
        });
        
        let markerDest = new google.maps.Marker({
            position: destlatLng,
            map: map
        }); */
        if (!date_for_map) {
            date_for_map = Date.now();
        }
        let date = Date.now();
        //date.setHours(23);
        var request = {
            origin: sourcelatLng,
            destination: destlatLng,
            // Note that Javascript allows us to access the constant
            // using square brackets and a string value as its
            // "property."
            travelMode: google.maps.TravelMode[selectedMode],
            transitOptions: {
                departureTime: date.getTime, //date_for_map,
                modes: ['TRAIN'],
                //routingPreference: 'FEWER_TRANSFERS'
            }
        };
        var directionsService = new google.maps.DirectionsService();
        directionsService.route(request, function (response, status) {
            if (status == 'OK') {
                directionsDisplay.setDirections(response);
            }
        });
        return;
    }
}