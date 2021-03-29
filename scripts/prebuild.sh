#!/usr/bin/env sh
SCRIPT_DIR=$(dirname $0)
yum install libuuid-devel libmount-devel && cp /lib64/{libuuid,libmount,libblkid}.so.1 node_modules/canvas/build/Release/
node $SCRIPT_DIR/fetchMoonData.js  