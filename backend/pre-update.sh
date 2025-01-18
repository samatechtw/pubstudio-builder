#!/bin/bash

echo "Running pre-update script"
URL="http://localhost:3100/api/actions/persist-usage"
response=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $? -ne 0 ]; then
    echo "Error: Unable to reach $URL"
    exit 1
fi

if [ "$response" -eq 200 ]; then
    echo "persist-usage succeeded"
    sleep 1
else
    echo "persist-usage failed, skipping update"
    sleep 1
    exit 1
fi
echo "Pre update completed"
exit 0
