#!/bin/bash
cd /home/ec2-user/lovojbackend
pm2 stop LovojBackendB2BStaging || true
npm run start-stage-pm2


