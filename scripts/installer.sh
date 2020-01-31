#!/bin/bash

npm install electron-rebuild
./node_modules/.bin/electron-rebuild
sudo usermod -a -G gpio pi
sudo chmod u+s /opt/vc/bin/tvservice && sudo chmod u+s /bin/chvt

