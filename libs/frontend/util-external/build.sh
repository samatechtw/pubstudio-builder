rm -rf ../../../dist/libs/util-external
mkdir -p ../../../dist/libs/util-external
npx vite build
mv -f ./dist ../../../dist/libs/util-external/
cp ./package.json ../../../dist/libs/util-external
mkdir -p ../../../dist/libs/util-external/dist/assets
cp ../ui-theme/src/font/* ../../../dist/libs/util-external/dist/assets/
