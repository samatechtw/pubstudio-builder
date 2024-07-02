rm -rf ../../../dist/libs/feature-external
mkdir -p ../../../dist/libs/feature-external
npx vite build
mv -f ./dist ../../../dist/libs/feature-external/
cp ./package.json ../../../dist/libs/feature-external
# Fonts and CSS
mkdir -p ../../../dist/libs/feature-external/dist/assets
cp -rf ../ui-theme/src/* ../../../dist/libs/feature-external/dist/assets/
