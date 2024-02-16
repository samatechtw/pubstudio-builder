rm -rf ../../../dist/libs/feature-external
mkdir -p ../../../dist/libs/feature-external
npx vite build
mv -f ./dist ../../../dist/libs/feature-external/
cp ./package.json ../../../dist/libs/feature-external
mkdir -p ../../../dist/libs/feature-external/dist/assets
cp ../ui-theme/src/font/* ../../../dist/libs/feature-external/dist/assets/
