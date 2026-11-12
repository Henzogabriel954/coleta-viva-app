#!/bin/bash
cd /opt/coleta-viva/app
export ELECTRON_DISABLE_SANDBOX=1
export EXPO_NO_DEVTOOLS=1
export EXPO_USE_METRO_WORKSPACE_ROOT=1
export REACT_NATIVE_PACKAGER_HOSTNAME=p2.hcraft.online
export EXPO_PUBLIC_API_URL=http://p2.hcraft.online:8080
export NODE_OPTIONS="--max-old-space-size=1536"
exec npx expo start --go --clear --port 19000 --max-workers 2
