from . import _WEB_MODULE
import idom


class Schema:
    def __init__(self,
                 label_schema: list = [],
                 config: dict = {},
                 tokenized: bool = False):
        self.label_schema = label_schema
        self.config = config
        self.tokenized = tokenized
        self.widget = idom.web.export(_WEB_MODULE, "SchemaBuilderWidget")

    def __set_label_schema(self, label_schema):
        self.label_schema = label_schema

    def get_label_schema(self):
        return self.label_schema

    @idom.component
    def show(self):
        return self.widget({
            "label_schema": self.label_schema,
            "config": self.config,
            "tokenized": self.tokenized,
            "ipy_set_label_schema": self.__set_label_schema
        })
