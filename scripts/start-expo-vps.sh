#!/bin/bash
cd /opt/coleta-viva/app
export CI=1
export ELECTRON_DISABLE_SANDBOX=1
export EXPO_NO_DEVTOOLS=1
export EXPO_USE_METRO_WORKSPACE_ROOT=1
export REACT_NATIVE_PACKAGER_HOSTNAME=p2.hcraft.online
export EXPO_PUBLIC_API_URL=http://p2.hcraft.online:8080
exec npx expo start --web --port 19535
