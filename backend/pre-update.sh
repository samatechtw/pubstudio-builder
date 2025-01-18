#!/bin/bash

echo "Running pre-update script"
if curl http://localhost:3100/api/actions/persist-usage; then
    sleep 5
    echo "persist-usage succeeded"
else
    echo "persist-usage failed, continuing..."
    sleep 5
    exit 1
fi
echo "Pre update completed"
exit 0
