#!/bin/bash

echo "Running pre-update script"
if curl http://localhost:3100/api/actions/persist-usage; then
    echo "persist-usage succeeded"
else
    echo "persist-usage failed, continuing..."
fi
echo "Pre update completed"
exit 0
