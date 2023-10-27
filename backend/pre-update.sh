#!/bin/bash

echo "Running pre-update script"
if curl http://localhost:3100/api/actions/persist-cache; then
    echo "persist-cache succeeded"
else
    echo "persist-cache failed, continuing..."
fi
echo "Pre update completed"
exit 0
