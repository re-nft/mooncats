#!/usr/bin/env sh
SCRIPT_DIR=$(dirname $0)
yum install libuuid-devel libmount-devel zlib-devel && cp /lib64/{libuuid,libmount,libblkid,libz}.so.1 node_modules/canvas/build/Release/
mkdir -p /public/cats
node $SCRIPT_DIR/fetchMoonData.js  