#!/bin/bash
sed -i -e '/@import url/d' src/index.css
sed -i '1i @import url("https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap");' src/index.css
