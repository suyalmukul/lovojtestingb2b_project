#!/bin/bash
cd /home/ec2-user/lovojbackend
pm2 stop LovojBackendB2BStaging || true
rm -rf node_modules package-lock.json
npm install


