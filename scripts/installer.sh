#!/bin/bash

npm install electron-rebuild
./node_modules/.bin/electron-rebuild
sudo usermod -a -G gpio pi || echo "Error command: sudo usermod -a -G gpio pi"
sudo chmod -f u+s /opt/vc/bin/tvservice && sudo chmod -f u+s /bin/chvt || echo "Error command: sudo chmod u+s /opt/vc/bin/tvservice && sudo chmod u+s /bin/chvt"

