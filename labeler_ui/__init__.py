from pathlib import Path
import idom_jupyter

PRODUCTION = True
BUNDLE_JS = "bundle.min.js"
try:
    from .dev.development import get_epoch
    PRODUCTION = False
    BUNDLE_JS = "bundle.js"
except ImportError or ModuleNotFoundError:
    pass
_VERSION_PATH = Path(__file__).parent / 'version'
VERSION = Path(_VERSION_PATH).read_text().strip()
print("labeler-ui: " + VERSION)
MODULE_NAME = f"labeler_ui@{VERSION}"

_WEB_MODULE = idom.web.module_from_url(
    "https://unpkg.com/labeler-ui@0.0.10/bundle.0.2.0.js")

BUNDLE_PATH = Path(__file__).parent / BUNDLE_JS
FALLBACK = "Failed to display labeler_ui widget."
from .widgets.Annotation import Annotation
from .widgets.Authentication import Authentication
from .widgets.Dashboard import Dashboard
from .widgets.ProjectManager import ProjectManager