from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from tethys_sdk.gizmos import Button,MVDraw,MVView,MapView
from tethysapp.rheas_viewerv2.model import *
from tethysapp.rheas_viewerv2.utilities import *
import tethysapp.rheas_viewerv2.config as cfg

@login_required()
def home(request):
    """
    Controller for the app home page.
    """
    save_button = Button(
        display_text='',
        name='save-button',
        icon='glyphicon glyphicon-floppy-disk',
        style='success',
        attributes={
            'data-toggle':'tooltip',
            'data-placement':'top',
            'title':'Save'
        }
    )
    drawing_options = MVDraw(
    	controls=[ 'Delete',  'Point', 'Polygon', 'Box'],
    	initial='Point',
    	output_format='WKT'
    )

    view_options = MVView(
        projection='EPSG:4326',
        center=[-100, 40],
        zoom=3.5,
        maxZoom=18,
        minZoom=2
    )
    home_map = MapView(
        height='100%',
        width='100%',
        layers=[],
        basemap='OpenStreetMap',
	view=view_options,
	draw=drawing_options
    )

    edit_button = Button(
        display_text='',
        name='edit-button',
        icon='glyphicon glyphicon-edit',
        style='warning',
        attributes={
            'data-toggle':'tooltip',
            'data-placement':'top',
            'title':'Edit'
        }
    )

    remove_button = Button(
        display_text='',
        name='remove-button',
        icon='glyphicon glyphicon-remove',
        style='danger',
        attributes={
            'data-toggle':'tooltip',
            'data-placement':'top',
            'title':'Remove'
        }
    )

    previous_button = Button(
        display_text='Previous',
        name='previous-button',
        attributes={
            'data-toggle':'tooltip',
            'data-placement':'top',
            'title':'Previous'
        }
    )

    next_button = Button(
        display_text='Next',
        name='next-button',
        attributes={
            'data-toggle':'tooltip',
            'data-placement':'top',
            'title':'Next'
        }
    )
    #rheas_dbs = get_database()
    # db_schemas = get_schemas()
    variable_info = get_variables_meta()
    geoserver_wms_url = cfg.geoserver['wms_url']
    geoserver_rest_url = cfg.geoserver['rest_url']
    geoserver_workspace = cfg.geoserver['workspace']

    context = {
        'save_button': save_button,
        'edit_button': edit_button,
        'remove_button': remove_button,
        'previous_button': previous_button,
        'next_button': next_button,
        'home_map': home_map,
        #"rheas_dbs":rheas_dbs,
        # "db_schemas":db_schemas,
        "variable_info":json.dumps(variable_info),
        "geoserver_wms_url":geoserver_wms_url,
        "geoserver_rest_url":geoserver_rest_url,
        "geoserver_workspace":geoserver_workspace
    }

    return render(request, 'rheas_viewerv2/home.html', context)

