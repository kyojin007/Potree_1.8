var mymap = L.map('leafletmap', {
    // center: [18.389189, -64.716866],
    center: [51.49883755, 0],
    zoom: 17,
    maxZoom: 23,
    minZoom: 13,
    detectRetina: true, // detect whether the sceen is high resolution or not.
    attributionControl: false
});

// var mybounds = [[18.388202, -64.718193],[18.389953, -64.715749]];
const mybounds = [[51.49851108,-0.21867621,51.49916402,-0.21741616]];
// const layerSrc = 'https://s3.eu-west-2.amazonaws.com/datapoints-io-maptiles/echo-alfa/bvi-tortola/SteelePoint3/ortho_tiles/{z}/{x}/{y}.png';
const layerSrc = 'https://datapoints-io-maptiles.s3.eu-west-2.amazonaws.com/echo-alfa/forensic-roofing-solutions/bergham-mews/ortho_tiles/{z}/{x}/{y}.png';

// Add Basemap
//L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png').addTo(mymap);
// L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{
L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
    minZoom: 10,
    maxNativeZoom: 21,
    maxZoom: 23,
    attributionControl: false
}).addTo(mymap);

var tiles = L.tileLayer(layerSrc, {
    minZoom: 10,
    maxNativeZoom: 22,
    minNativeZoom: 18,
    maxZoom: 23,
    noWrap: true,
    bounds: mybounds,
    attributionControl: false
}).addTo(mymap);

L.control.attribution({position: 'bottomleft'}).addTo(mymap);

var uasmarker=new L.marker([0,0], {
    draggable: true,
    icon: L.divIcon({
        html: '<i class="fa fa-circle "></i>',
        iconSize: [10, 10],
        className: 'cammarker'
    })
});

uasmarker.on("drag",markerdragged);

var lookatmarker=new L.marker([0,0], {
    icon: L.divIcon({
        html: '<i class="fa fa-circle "></i>',
        iconSize: [10, 10],
        className: 'camlookatmarker'
    })
});


var camerafootprintpolygon=new L.Polygon([[0,0],[0,0],[0,0],[0,0]],{color:'orange', weight: 5, className: 'camerafootprint'});

var imagefootprintpolygon=new L.Polygon([[0,0],[0,0],[0,0],[0,0]],{color:'cyan', weight: 5, className: 'imagefootprint'});

uasmarker.addTo(mymap);
lookatmarker.addTo(mymap);
camerafootprintpolygon.addTo(mymap);
imagefootprintpolygon.addTo(mymap);
