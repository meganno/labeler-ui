from genericpath import exists
import idom
from varname import argname
from ..idom_loader import load_component


class ProjectManager:

    def __init__(self, project=None, name=None):
        self.__widget = load_component(name='ProjectManagerWidget')
        self.__project = project
        self.__name = name
        if project is not None:
            if type(project) is str:
                self.__project = project
            else:
                self.__project = argname('project')

    @idom.component
    def show(self):
        return self.__widget({
            'ipy_project': self.__project,
            'name': self.__name
        })
