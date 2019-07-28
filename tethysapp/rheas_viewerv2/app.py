from tethys_sdk.base import TethysAppBase, url_map_maker


class RheasViewerv2(TethysAppBase):
    """
    Tethys app class for Rheas Viewer.
    """

    name = 'Rheas Viewer'
    index = 'rheas_viewerv2:home'
    icon = 'rheas_viewerv2/images/icon.gif'
    package = 'rheas_viewerv2'
    root_url = 'rheas-viewerv2'
    color = '#8e44ad'
    description = 'Place a brief description of your app here.'
    tags = ''
    enable_feedback = False
    feedback_emails = []

    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (
            UrlMap(
                name='home',
                url='rheas-viewerv2',
                controller='rheas_viewerv2.controllers.home'
            ),
        )
        return url_maps
