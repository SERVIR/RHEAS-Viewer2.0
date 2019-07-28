/*****************************************************************************
 * FILE:    LIS MAIN JS
 * DATE:    4 DECEMBER 2018
 * AUTHOR: Sarva Pulla
 * COPYRIGHT: (c) NASA SERVIR 2018
 * LICENSE: BSD 2-Clause
 *****************************************************************************/

/*****************************************************************************
 *                      LIBRARY WRAPPER
 *****************************************************************************/

var LIBRARY_OBJECT = (function() {
    // Wrap the library in a package function
    "use strict"; // And enable strict mode for this library

    /************************************************************************
     *                      MODULE LEVEL / GLOBAL VARIABLES
     *************************************************************************/
    var animationDelay,
        $btnGetPlot,
        compare,
        int_type,
        date_options,
        legend,
        lwmsLayer,
        map,
        $modalChart,
        $modalCompare,
        opacity,
        public_interface,			// Object returned by the module
        rwmsLayer,
        $slider,
        $sliderContainer,
        sliderInterval,
        tdWmsLayer,
        thredds_options,
        thredds_urls,
        threddss_wms_url,
        var_options;


    /************************************************************************
     *                    PRIVATE FUNCTION DECLARATIONS
     *************************************************************************/
    var add_compare,
        add_wms,
        clear_coords,
        get_ts,
        init_dropdown,
        init_events,
        init_jquery_vars,
        init_all,
        init_map,
        init_opacity_slider;
var rfd="03/31/2019",rtd="05/31/2019",files, filename='LIS_SERVIR_WA_'+rtd.substr(6,4)+rtd.substr(0,2)+rtd.substr(3,2)+'0000.d09.nc';
var fileDates=[];
    /************************************************************************
     *                    PRIVATE FUNCTION IMPLEMENTATIONS
     *************************************************************************/
var tvar="201905";
    clear_coords = function(){
        $("#point-lat-lon").val('');
        $("#poly-lat-lon").val('');
        $("#shp-lat-lon").val('');
    };


    init_jquery_vars = function(){

		    $( "#rfd" ).datepicker({
 startDate: '01/01/2019',
			 onSelect: function(dateText) {
				   rfd=dateText;       
			 }
		    });
		//if(rfd.length===0) rfd=$.datepicker.formatDate("mm/dd/yy", $("#rfd").datepicker("getDate"));

	 $( "#rtd" ).datepicker({
 startDate: '05/31/2019',
		 onSelect: function(dateText) {
		          rtd=dateText;
		   var xhr = ajax_update_database("get-files",{"from_date":rfd,"to_date":rtd});
	       	xhr.done(function(result) {
			console.log(result);
		   if("success" in result) {
			console.log("test2");
                   	 $("#lrd_table").html('');
                   	 $("#rrd_table").html('');

		   	 files=result["files"];
			console.log("last value");
			files.forEach(function(item,i){
                                console.log((item).split('.')[0]);
console.log((item).split('.')[0].split('_')[-1]);
		                var dt = (item).split('.')[0].split('_')[-1];
		                dt = moment(dt, "YYYYMMDD0000").format("MM/DD/YYYY");
				fileDates[i]=dt;
			});
			console.log(fileDates);
			console.log(files[files.length -1].split('.')[0].split('_')[5]);
                   	 files.forEach(function(item,i){
                   	console.log(item);


                        console.log((item).split('.')[0].split('_')[3]);
                        var dt = (item).split('.')[0].split('_')[5];
                        dt = moment(dt, "YYYYMMDD0000").format("MM/DD/YYYY");
                        console.log(dt);
			tvar=(item).split('.')[0].split('/')[-3];
			console.log(tvar);
                        var loption = new Option(dt,item);
                        var roption = new Option(dt,item);
                        $("#lrd_table").append(loption);
                        $("#rrd_table").append(roption);

                    });

}

    });
                }

            });
	//if(rtd.length===0) rtd=$.datepicker.formatDate("mm/dd/yy", $("#rtd").datepicker("getDate"));
	//console.log(rtd);



       console.log(files);
        $slider = $("#slider");
        $sliderContainer = $("#slider-container");
        $modalChart = $("#chart-modal");
        $modalCompare = $("#compare-modal");
        $btnGetPlot = $("#btn-get-plot");
        var $meta_element = $("#metadata");
        var_options = $meta_element.attr('data-var-options');
        var_options = JSON.parse(var_options);
        date_options = $meta_element.attr('data-date-options');
        date_options = JSON.parse(date_options);
        threddss_wms_url = $meta_element.attr('data-wms-url');
        thredds_options = $meta_element.attr('data-thredds-options');
        thredds_options = JSON.parse(thredds_options);

  
    };

    init_dropdown = function () {
        $(".style_table").select2({minimumResultsForSearch: -1});
        $(".interval_table").select2({minimumResultsForSearch: -1});
        $(".var_table").select2({minimumResultsForSearch: -1});
        $(".date_table").select2({minimumResultsForSearch: -1});
        $(".year_table").select2({minimumResultsForSearch: -1});
    };

    init_map = function() {
        map = L.map('map',{
            // timeDimension: true,
            // timeDimensionControl: true
        }).setView([13.5317, 2.464], 5);
        legend = L.control({
            position: 'bottomright'
        });
        var timeDimension = new L.TimeDimension();
        map.timeDimension = timeDimension;

        var player        = new L.TimeDimension.Player({
            loop: true,
            startOver:true
        }, timeDimension);

        var timeDimensionControlOptions = {
            player:        player,
            timeDimension: timeDimension,
            position:      'bottomleft',
            autoPlay:      false,
            minSpeed:      1,
            speedStep:     0.5,
            maxSpeed:      20,
            timeSliderDragUpdate: true,
            loopButton:true,
            limitSliders:true
        };

        var drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        var drawControlFull = new L.Control.DrawPlus({
            edit: {
                featureGroup: drawnItems,
                edit: false
            },
            draw: {
                polyline: false,
                circlemarker:false,
                rectangle:false,
                circle:false,
                polygon:{
                    shapeOptions: {
                        color: '#007df3',
                        weight: 4
                    },
                    allowIntersection: false, // Restricts shapes to simple polygons
                },
                shapefile: {
                    shapeOptions: {
                        color: '#007df3',
                        weight: 4,
                        opacity: 1,
                        fillOpacity: 0
                    }
                },
            }
        });

        map.addControl(drawControlFull);

        compare = L.control.sideBySide();
        var stateChangingButton = L.easyButton({
            states: [{
                stateName: 'enable-compare',        // name the state
                icon:      'glyphicon-resize-horizontal',               // and define its properties
                title:     'Enable side by side comparison',      // like its title
                onClick: function(btn, map) {       // and its callback
                    $modalCompare.modal('show');
                    map.removeControl(compare);
                    btn.state('disable-compare');    // change state on click!
                }
            }, {
                stateName: 'disable-compare',
                icon:      'glyphicon-transfer',
                title:     'Disable side by side comparison',
                onClick: function(btn, map) {
                    map.removeControl(compare);
                    map.removeLayer(lwmsLayer);
                    map.removeLayer(rwmsLayer);
                    tdWmsLayer.addTo(map);
                    btn.state('enable-compare');
                }
            }]
        });

        stateChangingButton.addTo(map);

        map.on("draw:drawstart ", function (e) {
            clear_coords();
            drawnItems.clearLayers();
        });

        map.on("draw:created", function (e) {
            clear_coords();
            drawnItems.clearLayers();
            var layer = e.layer;
            layer.addTo(drawnItems);

            var feature = drawnItems.toGeoJSON();
            var type = feature.features[0].geometry.type;
            int_type = type;
            if (type == 'Point'){
                var coords = feature["features"][0]["geometry"]["coordinates"];
                $("#point-lat-lon").val(coords);
                get_ts();

            } else if (type == 'Polygon'){

                var coords = feature["features"][0]["geometry"];
                $("#poly-lat-lon").val(JSON.stringify(coords));
                get_ts();
            }
        });

        var timeDimensionControl = new L.Control.TimeDimension(timeDimensionControlOptions);
        map.addControl(timeDimensionControl);

        var mapLink =
            '<a href="http://openstreetmap.org">OpenStreetMap</a>';
        L.tileLayer(
            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; ' + mapLink + ' Contributors',
                maxZoom: 18,
            }).addTo(map);

        var wmsUrl = "https://tethys.servirglobal.net/thredds/wms/tethys/HIWAT/hkhControl_20180329-1800_latlon.nc";
        var wmsLayer = L.tileLayer.wms(wmsUrl, {
            layers: 'APCP_surface',
            format: 'image/png',
            transparent: true,
            style:'boxfill/apcp_surface'
        });

        tdWmsLayer = L.timeDimension.layer.wms(wmsLayer);
        lwmsLayer = L.tileLayer.wms();
        rwmsLayer = L.tileLayer.wms();

    };


    init_events = function(){

        map.on("mousemove", function (event) {
            document.getElementById('mouse-position').innerHTML = 'Latitude:'+event.latlng.lat.toFixed(5)+', Longitude:'+event.latlng.lng.toFixed(5);
        });


    };

    init_all = function(){
        init_jquery_vars();
        init_map();


        init_events();
        init_dropdown();

        init_opacity_slider();

    };

    init_opacity_slider = function(){
        opacity = 0.7;
        $("#opacity").text(opacity);
        $( "#opacity-slider" ).slider({
            value:opacity,
            min: 0.2,
            max: 1,
            step: 0.1, //Assigning the slider step based on the depths that were retrieved in the controller
            animate:"fast",
            slide: function( event, ui ) {

            }
        });
    };


    add_wms = function(tvar,var_type,run_date,rmin,rmax,styling){

        map.removeControl(legend);
console.log(tvar);

console.log(var_type);
console.log(run_date);
        // var wmsUrl = threddss_wms_url+sdir+'/'+file_name;
console.log("from add wms");
        var wmsUrl =threddss_wms_url+'forecast_esp/'+tvar+'/'+filename;
console.log(wmsUrl);
        // map.removeLayer(wms_layer);
        map.removeLayer(tdWmsLayer);
        var index = find_var_index(var_type,var_options);
        // gen_color_bar(var_options[index]["colors_list"],scale);
        var layer_id = var_options[index]["id"];
        var range = rmin+','+rmax;

        var style = 'boxfill/'+styling;
        opacity = $('#opacity-slider').slider("option", "value");

        var wmsLayer = L.tileLayer.wms(wmsUrl, {
            layers: var_type,
            format: 'image/png',
            transparent: true,
            styles: style,
            colorscalerange: range,
            opacity:opacity,
            version:'1.3.0'
        });


        $('.leaflet-bar-timecontrol').addClass('hidden');
        tdWmsLayer = wmsLayer;
        tdWmsLayer.addTo(map);


        var imgsrc = wmsUrl + "?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER="+layer_id+"&colorscalerange="+range+"&PALETTE="+styling+"&transparent=TRUE";
console.log(imgsrc);
        legend.onAdd = function(map) {
            var src = imgsrc;
            var div = L.DomUtil.create('div', 'info legend');
            div.innerHTML +=
                '<img src="' + src + '" alt="legend">';
            return div;
        };
        legend.addTo(map);

    };
       
    get_ts = function(){
        if($("#poly-lat-lon").val() == "" && $("#point-lat-lon").val() == "" && $("#shp-lat-lon").val() == ""){
            $('.error').html('<b>No feature selected. Please create a feature using the map interaction dropdown. Plot cannot be generated without a feature.</b>');
            return false;
        }else{
            $('.error').html('');
        }

        var interaction = int_type;



        var var_type = ($("#var_table option:selected").val());


        if(interaction=="Point"){
            var geom_data = $("#point-lat-lon").val();
        }else if(interaction == "Polygon"){
            var geom_data = $("#poly-lat-lon").val();
        }
        $modalChart.modal('show');
        $("#cube").removeClass('hidden');
        $("#plotter").addClass('hidden');
var run_type="";
console.log(files);
        var xhr = ajax_update_database("get-ts",{"variable":var_type,"files":files.toString(),"interaction":interaction,"geom_data":geom_data});
        xhr.done(function(result) {
            if("success" in result) {
                // var json_response = JSON.parse(result);
                var index = find_var_index(var_type,var_options);
                var display_name = var_options[index]["display_name"];
                var units = var_options[index]["units"];
                $('.error').html('');
                $('#plotter').highcharts({
                    chart: {
                        type:'spline',
                        zoomType: 'x'
                    },
                    tooltip: {
                        backgroundColor: '#FCFFC5',
                        borderColor: 'black',
                        borderRadius: 10,
                        borderWidth: 3
                    },
                    title: {
                        text: $("#var_table option:selected").text() + " values at " + result.data["geom"] ,
                        style: {
                            fontSize: '14px'
                        }
                    },
                    xAxis: {
                        type: 'datetime',
                        labels: {
                            format: '{value: %Y-%m-%d}'
                            // rotation: 45,
                            // align: 'left'
                        },
                        title: {
                            text: 'Date'
                        }
                    },
                    yAxis: {
                        title: {
                            text: units
                        }

                    },
                    exporting: {
                        enabled: true
                    },
                    series: [{
                        data:result.data["plot"],
                        name: display_name
                    }]

                });
                $("#cube").addClass('hidden');
                $("#plotter").removeClass('hidden');
            } else {
                $("#cube").addClass('hidden');
                $(".error").append('<h3>Error Processing Request.</h3>');
                $("#plotter").removeClass('hidden');
            }
        });

    };

    $("#btn-get-plot").on('click',get_ts);

    add_compare = function(){
        map.removeLayer(tdWmsLayer);
        map.removeLayer(lwmsLayer);
        map.removeLayer(rwmsLayer);
        $modalCompare.modal('hide');

        var run_date = ($("#rd_table option:selected").val());

        var style =  ($("#style_table option:selected").val());

        var l_date = $("#lrd_table option:selected").val();
        var l_var = $("#lvar_table option:selected").val();
        var r_date = $("#rrd_table option:selected").val();
        var r_var = $("#rvar_table option:selected").val();

        var lwmsUrl = threddss_wms_url+run_type+'/'+'/'+run_date+'/'+l_date;

        var rwmsUrl = threddss_wms_url+run_type+'/'+'/'+run_date+'/'+r_date;

        // map.removeLayer(wms_layer);
        var lindex = find_var_index(l_var,var_options);
        var rindex = find_var_index(r_var,var_options);

        // var layer_id = var_options[index]["id"];
        var lrange = var_options[lindex]["min"]+','+var_options[lindex]["max"];
        var rrange = var_options[rindex]["min"]+','+var_options[rindex]["max"];
        var styling = 'boxfill/'+style;
        opacity = $('#opacity-slider').slider("option", "value");

        lwmsLayer = L.tileLayer.wms(lwmsUrl, {
            layers: l_var,
            format: 'image/png',
            transparent: true,
            styles: styling,
            colorscalerange: lrange,
            opacity:opacity,
            version:'1.3.0'
        });

        rwmsLayer = L.tileLayer.wms(rwmsUrl, {
            layers: r_var,
            format: 'image/png',
            transparent: true,
            styles: styling,
            colorscalerange: rrange,
            opacity:opacity,
            version:'1.3.0'
        });

        lwmsLayer.addTo(map);
        rwmsLayer.addTo(map);
        compare = L.control.sideBySide(lwmsLayer,rwmsLayer);
        compare.addTo(map);

    };
    $("#btn-add-compare").on('click',add_compare);

    /************************************************************************
     *                        DEFINE PUBLIC INTERFACE
     *************************************************************************/

    public_interface = {

    };

    /************************************************************************
     *                  INITIALIZATION / CONSTRUCTOR
     *************************************************************************/

    // Initialization: jQuery function that gets called when
    // the DOM tree finishes loading
    $(function() {
        init_all();


        date_options['colors'].forEach(function(item,i){
            var new_option = new Option(item[0],item[1]);
            $("#style_table").append(new_option);
        });
            $("#var_table").html('');
            $("#lvar_table").html('');
            $("#rvar_table").html('');


            var_options.forEach(function(item,i){
console.log(item);
                    var new_option = new Option(item["display_name"]+' ('+item["units"]+')',item["id"]);
                    var loption = new Option(item["display_name"]+' ('+item["units"]+')',item["id"]);
                    var roption = new Option(item["display_name"]+' ('+item["units"]+')',item["id"]);

                    $("#var_table").append(new_option);
                    $("#lvar_table").append(loption);
                    $("#rvar_table").append(roption);

            });
var style =  ($("#style_table option:selected").val());
            var rmin = $("#range-min").val();
            var rmax = $("#range-max").val();
 add_wms(tvar,($("#var_table option:selected").val()),rtd,rmin,rmax,style);
       /*     thredds_options['catalog']['forecast_esp']['SURFACEMODEL'].forEach(function(item,i){
                var  dt = moment(item, "YYYYMM").format("MMMM YYYY");
                var new_option = new Option(dt,item);
                $("#rd_table").append(new_option);
            });
  	    thredds_options['catalog']['forecast_esp']['ROUTING'].forEach(function(item,i){
                var  dt = moment(item, "YYYYMM").format("MMMM YYYY");
                var new_option = new Option(dt,item);
                $("#rd_table").append(new_option);
            });
    	    thredds_options['catalog']['retrospective']['SURFACEMODEL'].forEach(function(item,i){
                var  dt = moment(item, "YYYYMM").format("MMMM YYYY");
                var new_option = new Option(dt,item);
                $("#rd_table").append(new_option);
            });
  	    thredds_options['catalog']['retrospective'].forEach(function(item,i){
               console.log(item);
            });*/

         
       

        $("#rtd_table").change(function(){
console.log("from chnage");
            var xhr = ajax_update_database("get-files",{"from_date":rfd,"to_date":rtd});

            xhr.done(function(result) {
                if("success" in result) {

                    $("#lrd_table").html('');
                    $("#rrd_table").html('');
                    result["files"].forEach(function(item,i){
                        // console.log((item).split('.')[0].split('_')[3]);
                        var dt = (item).split('.')[0].split('_')[3];
                        dt = moment(dt, "YYYYMMDD0000").format("MMMM D, YYYY");
                        var loption = new Option(dt,item);
                        var roption = new Option(dt,item);
                        $("#lrd_table").append(loption);
                        $("#rrd_table").append(roption);

                    });
                }
            });

        }).change();

        $("#rfd_table").change(function(){
console.log("from chnag1e");
            var xhr = ajax_update_database("get-files",{"from_date":rfd,"to_date":rtd});
var tmp="";
            xhr.done(function(result) {
                if("success" in result) {
                    $("#lrd_table").html('');
                    $("#rrd_table").html('');
                    result["files"].forEach(function(item,i){
                        // console.log((item).split('.')[0].split('_')[3]);
                        var dt = (item).split('.')[0].split('_')[3];
                        dt = moment(dt, "YYYYMMDD0000").format("MMMM D, YYYY");
                        var loption = new Option(dt,item);
                        var roption = new Option(dt,item);
                        $("#lrd_table").append(loption);
                        $("#rrd_table").append(roption);
                        tmp=(item).split('.')[0].split('/')[-3];
                    });
                }
            });
        }).change();

        $("#opacity-slider").on("slidechange", function(event, ui) {
            opacity = ui.value;
            $("#opacity").text(opacity);
            tdWmsLayer.setOpacity(opacity);

        });

        $("#var_table").change(function(){
            var var_type = ($("#var_table option:selected").val());
            var index = find_var_index(var_type,var_options);
            $("#style_table").val(var_options[index]["style"]);
            $("#range-min").val(var_options[index]["min"]);
            $("#range-max").val(var_options[index]["max"]);

            // $("#range-max").trigger('change');
            if(typeof int_type !== 'undefined'){
                get_ts();
            }
            $("#style_table").trigger('change');

        }).change();

    });

    return public_interface;

}()); // End of package wrapper
// NOTE: that the call operator (open-closed parenthesis) is used to invoke the library wrapper
// function immediately after being parsed.
