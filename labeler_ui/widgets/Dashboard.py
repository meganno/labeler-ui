import idom
from varname import argname
from ..idom_loader import load_component


class Dashboard:

    def __init__(self, service=None, config: dict = {}):
        self.__widget = load_component(name='DashboardWidget')
        self.__service = service
        self.__config = config
        if service is not None:
            if type(service) is str:
                self.__service = service
            else:
                self.__service = argname('service')

    @idom.component
    def show(self):
        if 'height' in self.__config:
            self.__config['height'] = max(300, self.__config['height'])
        return self.__widget({
            'config': self.__config,
            'ipy_service': self.__service
        })