#!/usr/bin/env bash
SCRIPT_DIR=$(dirname $0)
yum install libuuid-devel libmount-devel zlib-devel && cp /lib64/{libuuid,libmount,libblkid,libz}.so.1 node_modules/canvas/build/Release/
node $SCRIPT_DIR/fetchMoonData.js  