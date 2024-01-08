#!/bin/bash

outfile=$1

shift

echo -e "[workspace]\n" > $outfile
echo "members = [" >> $outfile
while test ${#} -gt 0
do
  echo "    \"$1\"," >> $outfile
  shift
done
echo -e "]\n" >> $outfile

