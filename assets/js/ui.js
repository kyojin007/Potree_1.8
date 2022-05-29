import { viewer } from '../../dist/main';

var cmap = Potree.Gradients["RAINBOW"];
$('#lookAtFilter').hide();
$('#toggleLookAtPtVisible').hide();

function stepCarousel(stepdir){
    $('#carouselExampleIndicators').carousel(stepdir);
}

$('#carouselExampleIndicators').on('slide.bs.carousel', function (ev) {
    var id = ev.relatedTarget.id;
    var str='';
    switch (id) {
        case "carousel_1":
            str = '(1/12) - Layout';
            break;
        case "carousel_2":
            str = '(2/12) - Image Pyramids';
            break;
        case "carousel_3":
            str = '(3/12) - Simplifying the Layout';
            break;
        case "carousel_4":
            str = '(4/12) - Navigation';
            break;
        case "carousel_5":
            str = '(5/12) - Navigating to "Look-through" view';
            break;
        case "carousel_6":
            str = '(6/12) - Navigating in "Look-through" view';
            break;
        case "carousel_7":
            str = '(7/12) - Map Layout';
            break;
        case "carousel_8":
            str = '(8/12) - Measuring Tools';
            break;
        case "carousel_9":
            str = '(10/12) - Changing the Appearance';
            break;
        case "carousel_10":
            str = '(12/12) - Downloading Data';
            break;
        case "carousel_11":
            str = '(9/12) - "Look At" Tool';
            break;
        case "carousel_12":
            str = '(11/12) - "Look At" Image Opacity';
            break;
        default:
        //the id is none of the above 11/9/12/10 = 9/10/11/12
    }
    $('#helpsubtitle').text(str);
})

$('#toggleimage').on('click', function (e) {
    if(camsvisible){
        if (cameraplaneview) {
            imageplane.visible = false;
        }
        else {
            turnImagesOff();
        }
        camsvisible = false;
        $('#cameraicon').removeClass('buttonfgclicked');
    }
    else {
        if (cameraplaneview) {
            imageplane.visible = true;
        }
        else {
            turnImagesOn();
        }
        camsvisible = true;
        $('#cameraicon').addClass('buttonfgclicked');
    }
});

$('#imgleft').on('click', function (e) {
    currentid--;
    if (currentid < 0) {
        currentid = ncams - 1;
    }
    var count=0;
    var flag = true;
    if (dofilterimages) {
        while (imageobj[currentid].isFiltered) {
            currentid--;
            count++;
            if (currentid < 0) {
                currentid = ncams - 1;
            }
            if (count > ncams) {
                flag = false;
                break;
            }
        }
    }
    if (flag) {
        flyToCam(currentid);
    }
});

$('#imgright').on('click', function (e) {

    currentid++;
    if (currentid>(ncams-1)){currentid=0;}

    var count=0;
    var flag = true;
    if (dofilterimages) {
        while (imageobj[currentid].isFiltered) {
            currentid++;
            count++;
            if (currentid > (ncams - 1)) {
                currentid = 0;
            }

            if (count > ncams) {
                flag = false;
                break;
            }
        }
    }
    if (flag) {
        flyToCam(currentid);
    }

});

$('#measPoint').on('click', measPoint);
$('#measDistance').on('click', measDistance);
$('#measHeight').on('click', measHeight);
$('#measAngle').on('click', measAngle);
$('#measClear').on('click', measClear);
$('#measLookAt').on('click', measLookAt);
$('#lookAtFilter').on('click', toggleFilterImages);
$('#toggleLookAtPtVisible').on('click', toggleLookAtPtVisible);

$('#togglemap').on('click', togglemap);

$('#btntogglelighting').on('click', toggleEDL);
$('#btntoggleHQ').on('click', toggleHQ);

$('#btnRGB').on('click', colorbyRGB);
$('#btnBoth').on('click', colorbyBoth);
$('#btnElev').on('click', colorbyElev);

$('#btnColormap1').on('click', changeColormap);
$('#btnColormap2').on('click', changeColormap);
$('#btnColormap3').on('click', changeColormap);
$('#btnColormap4').on('click', changeColormap);
$('#btnColormap5').on('click', changeColormap);
$('#btnColormap6').on('click', changeColormap);
$('#btnColormap7').on('click', changeColormap);

/**
 *
 */
function toggleLookAtPtVisible() {
    if (viewer.scene.measurements[lookAtPtNum].visible){
        viewer.scene.measurements[lookAtPtNum].visible = false;
        $('#lookatvisible').removeClass('buttonfgclicked');
    }
    else {
        viewer.scene.measurements[lookAtPtNum].visible = true;
        $('#lookatvisible').addClass('buttonfgclicked');
    }

}

/**
 *
 */
function toggleFilterImages(){
    if (dofilterimages){
        dofilterimages = false;
        turnImagesOn();
        if (!camsvisible){
            turnImagesOff();
        }
        else {
            turnImagesOn();
            $('#cameraicon').addClass('buttonfgclicked');
        }
        $('#filterbtn').removeClass('buttonfgclicked');
    }
    else {
        dofilterimages = true;
        filterImages();
        $('#cameraicon').addClass('buttonfgclicked');

        if (cameraplaneview){
            if (!camsvisible){
                turnImagesOff();
            }
            else {
                turnImagesOff();
                $('#cameraicon').addClass('buttonfgclicked');
            }
            $('#cameraicon').removeClass('buttonfgclicked');
        }
        $('#filterbtn').addClass('buttonfgclicked');
    }
}

function toggleEDL(){
    if (viewer.useEDL){
        viewer.useEDL = false;
        $('#btnlightbulb').removeClass('buttonfgclicked');
    }
    else {
        viewer.useEDL = true;
        $('#btnlightbulb').addClass('buttonfgclicked');

    }
}

function toggleHQ(){
    if (viewer.useHQ){
        viewer.useHQ = false;
        $('#btnHQ').removeClass('buttonfgclicked');
    }
    else {
        viewer.useHQ = true;
        $('#btnHQ').addClass('buttonfgclicked');
    }
}

function changeColormap(){
    switch(this.id){
        case "btnColormap1":
            cmap = Potree.Gradients["GRAYSCALE"];
            break;
        case "btnColormap2":
            cmap = Potree.Gradients["INFERNO"];
            break;
        case "btnColormap3":
            cmap = Potree.Gradients["PLASMA"];
            break;
        case "btnColormap4":
            cmap = Potree.Gradients["RAINBOW"];
            break;
        case "btnColormap5":
            cmap = Potree.Gradients["SPECTRAL"];
            break;
        case "btnColormap6":
            cmap = Potree.Gradients["VIRIDIS"];
            break;
        case "btnColormap7":
            cmap = Potree.Gradients["YELLOW_GREEN"];
            break;
    }
    viewer.scene.pointclouds[0].material.gradient = cmap;
}

function colorbyRGB(){
    viewer.scene.pointclouds.forEach( pc => pc.material.pointColorType = Potree.PointColorType.RGB );
    $( "#sliderColorBlend" ).slider('value',0);
    $( "#colorblendValue" ).val(0);
    viewer.scene.pointclouds[0].material.weightElevation = 0;
    viewer.scene.pointclouds[0].material.weightRGB = 1;
}

function colorbyElev(){
    viewer.scene.pointclouds.forEach( pc => pc.material.pointColorType = Potree.PointColorType.ELEVATION );
    $( "#sliderColorBlend" ).slider('value',100);
    $( "#colorblendValue" ).val(100);
    viewer.scene.pointclouds[0].material.weightElevation = 1;
    viewer.scene.pointclouds[0].material.weightRGB = 0;
}

function colorbyBoth() {
    viewer.scene.pointclouds.forEach(pc => pc.material.pointColorType = Potree.PointColorType.COMPOSITE);
    $( "#sliderColorBlend" ).slider('value',50);
    $( "#colorblendValue" ).val(50);
    viewer.scene.pointclouds[0].material.weightElevation = 50/100;
    viewer.scene.pointclouds[0].material.weightRGB = 50/100;
}

function togglemap(){
    if (mapshow) {
        $('#mapcontainer').hide();
        mapshow = false;
        $('#mapbutton').removeClass('buttonfgclicked');
    } else {
        $('#mapcontainer').show();
        mapshow = true;
        $('#mapbutton').addClass('buttonfgclicked');
    }
}

$('#mapcontainer').on('click',triggermapresize);

function triggermapresize(){
    mymap.invalidateSize();
}

$('.keep-open').on({
    "shown.bs.dropdown": function() { $(this).attr('closable', false); },
    "hide.bs.dropdown":  function() { return $(this).attr('closable') == 'true'; }
});

$('#measheader').on({
    "click": function() {
        $('.keep-open').attr('closable', true );
        $(this).parent().attr('closable', true );
    }
});

$('#appearanceheader').on({"click": function() {
        $('.keep-open').attr('closable', true );
        $(this).parent().attr('closable', true );
    }
});

$('#downloadheader').on({"click": function() {
        $('.keep-open').attr('closable', true );
        $(this).parent().attr('closable', true );
    }
});


$('.keep-open .nav-link').on({"click": function() {
        $('.keep-open').attr('closable', true );
        $(this).parent().attr('closable', true );
    }
});

var zlimits = [-0.8, 19.1];
$( "#minval" ).val( 0 );
$( "#maxval" ).val( 15 );

$(function() {
    $( "#slider-range" ).slider({
        range: true,
        min: Math.floor(zlimits[0]*10)/10,
        max: Math.ceil(zlimits[1]*10)/10,
        values: [ Math.floor(zlimits[0]*10)/10, Math.ceil(zlimits[1]*10)/10 ],
        step: 0.1,
        slide: function( event, ui ) {
            $( "#minval" ).val( ui.values[ 0 ]);
            $( "#maxval" ).val( ui.values[ 1 ]);
            viewer.scene.pointclouds[0].material.elevationRange = [ui.values[ 0 ], ui.values[ 1 ]];
        }
    });
} );

$( function() {
    $( "#sliderColorBlend" ).slider({
        range: false,
        min: 0,
        max: 100,
        value: 0,
        step: 5,
        slide: function( event, ui ) {
            $( "#colorblendValue" ).val( ui.value);
            viewer.scene.pointclouds[0].material.weightElevation = ui.value/100;
            viewer.scene.pointclouds[0].material.weightRGB = 1-ui.value/100;
            viewer.scene.pointclouds.forEach(pc => pc.material.pointColorType = Potree.PointColorType.COMPOSITE);
        }
        }
    );
} );

$( function() {
    $( "#sliderImageOpacity" ).slider({
            range: false,
            min: 0,
            max: 100,
            value: 100,
        slide: function( event, ui ) {
            $( "#sliderImageOpacityValue" )
                .val( ui.value.toString() + '%');
            imageplane.children[0].material.opacity = ui.value/100;
        }
        }
    );
} );

$( function() {
    $( "#sliderPointBudget" ).slider({
            range: false,
            min: 1000000,
            max: 10000000,
            value: 1000000,
            step: 500000,
        slide: function( event, ui ) {
            $( "#sliderPointBudgetValue" )
                .val( (ui.value/1000000).toString() + 'M');
            viewer.setPointBudget(ui.value);
        }
        }
    );
} );

// viewer.minNodeSize = 50;

$( function() {
    $( "#sliderPointSize" ).slider({
            range: false,
            min: 0,
            max: 400,
            value: 50,
        slide: function( event, ui ) {
            $( "#sliderPointSizeValue" )
                .val( ui.value);
            viewer.minNodeSize = ui.value;
        }
        }
    );
} );

// FUNCTION TO GET COLORMAPS TO MAKE IMAGE OF THEM
function printColorMap(){
    var j=0;
    for(j=0;j<7;j++) {
        switch(j){
            case 0:
                cmap = Potree.Gradients["GRAYSCALE"];
                break;
            case 1:
                cmap = Potree.Gradients["INFERNO"];
                break;
            case 2:
                cmap = Potree.Gradients["PLASMA"];
                break;
            case 3:
                cmap = Potree.Gradients["RAINBOW"];
                break;
            case 4:
                cmap = Potree.Gradients["SPECTRAL"];
                break;
            case 5:
                cmap = Potree.Gradients["VIRIDIS"];
                break;
            case 6:
                cmap = Potree.Gradients["YELLOW_GREEN"];
                break;
        }

        var i;
        var strout = '';
        nelements = cmap.length;
        for (i = 0; i < nelements; i++) {
            strout = strout + '\n' + (cmap[i][0].toString() + ',' + cmap[i][1].r.toString() + ',' + cmap[i][1].g.toString() + ',' + cmap[i][1].b.toString());
        }
        console.log(strout);

    }
}
