import time

import idom
import pydash
import requests

from labeler_ui.helpers import get_request

from ..idom_loader import load_component
from . import KERNEL_ID


class Authentication:
    def __init__(
        self, host=None, project="base", firebase_org="megagon", firebase_config=None
    ):
        if not pydash.is_empty(host) and pydash.is_empty(project):
            raise Exception("Project cannot be None or empty.")
        self.id_token = None
        self.host = host
        self.firebase_org = firebase_org
        self.firebase_config = firebase_config
        self.project = project
        if pydash.is_empty(host):
            self.project = "base"
        self.__widget = load_component("AuthenticationWidget")

    def get_id_token(self):
        return str(self.id_token)

    def get_path(self):
        # megagon load balancer
        dns_name = "https://labeler.megagon.ai"
        if self.host is not None and len(self.host) > 0:
            dns_name = self.host
        return f"{dns_name}:5000/{self.project}/tokens"

    def get_access_tokens(self, job=False):
        payload = {"id_token": self.id_token, "job": job}
        response = get_request(self.get_path(), json=payload)
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(response.text)

    def create_access_token(
        self, note: str = "", expiration_duration: int = 14, demo=False, job=False
    ):
        payload = {"id_token": self.id_token}
        payload.update(
            {
                "note": note,
                "expiration_duration": expiration_duration,
                "demo": demo,
                "job": job,
            }
        )
        response = requests.post(self.get_path(), json=payload)
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(response.text)

    def delete_access_tokens(self, id_list: list = []):
        payload = {"id_token": self.id_token}
        payload.update({"id_list": id_list})
        response = requests.delete(self.get_path(), json=payload)
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(response.text)

    def __set_id_token(self, token):
        if token == "":
            token = None
        self.id_token = token

    @idom.component
    def show(self):
        current_time = int(time.time())
        authentication_ref = f"authentication_ref_{current_time}"
        setattr(Authentication, authentication_ref, self)
        is_demo_available = self.host == None or len(self.host) == 0
        return self.__widget(
            {
                "ipy_set_id_token": self.__set_id_token,
                "auth_varname": authentication_ref,
                "firebase_config": self.firebase_config,
                "firebase_org": self.firebase_org,
                "demo_available": is_demo_available,
                "ipy_kernel_id": KERNEL_ID,
            }
        )
