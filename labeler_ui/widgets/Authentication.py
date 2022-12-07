from labeler_ui.helpers import get_request
import idom, sys, requests
from ..idom_loader import load_component


class Authentication:

    def __init__(self):
        self.id_token = None
        self.__widget = load_component('AuthenticationWidget')

    def get_id_token(self):
        return str(self.id_token)

    def get_path(self):
        dns_name = 'http://a74bd49f7393e513d.awsglobalaccelerator.com'
        return '{}:5000/development/tokens'.format(dns_name)

    def get_access_tokens(self):
        payload = {'id_token': self.id_token}
        response = get_request(self.get_path(), json=payload)
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(response.text)

    def create_access_token(self,
                            note: str = '',
                            expiration_duration: int = 14):
        payload = {'id_token': self.id_token}
        payload.update({
            'note': note,
            'expiration_duration': expiration_duration
        })
        response = requests.post(self.get_path(), json=payload)
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(response.text)

    def delete_access_tokens(self, id_list: list = []):
        payload = {'id_token': self.id_token}
        payload.update({'id_list': id_list})
        response = requests.delete(self.get_path(), json=payload)
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(response.text)

    def __set_id_token(self, token):
        if (token == ""):
            token = None
        self.id_token = token

    @idom.component
    def show(self):
        auth_varname = ''
        for name, module in sys.modules.items():
            try:
                for varname, obj in module.__dict__.items():
                    if obj is self:
                        auth_varname = varname
            except AttributeError:
                pass
        return self.__widget({
            "ipy_set_id_token": self.__set_id_token,
            "auth_varname": auth_varname
        })