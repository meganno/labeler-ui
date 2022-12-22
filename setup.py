from setuptools import setup, find_packages
from pathlib import Path

version = Path("./labeler_ui/version").read_text().strip()
package = {
    "name":
    "labeler_ui",
    "version":
    version,
    "description":
    "labeler-ui NLP Annotation Tools in Jupyter Notebook",
    "url":
    "https://github.com/rit-git/labeler-ui",
    "author":
    "Megagon Labs",
    "author_email":
    "",
    "license":
    "unlicense",
    "packages":
    find_packages(exclude=["dev"]),
    "install_requires": [
        "idom==0.38.1", "idom-jupyter==0.7.6", "varname==0.8.1",
        "requests==2.26.0", 'urllib3==1.26.6'
    ],
    "include_package_data":
    True,
    "zip_safe":
    False
}
setup(**package)
