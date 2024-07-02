# PubStudio Backend

Cargo (Rust) workspace for PubStudio Site API, and related libraries.

The main setup instructions are located in the [site-api](./site-api/Readme.md) Readme.

## Library usage

TODO

## Run Site API Locally

Run these commands from the repository root after installing all prerequisites.

```bash
# Build frontend bundle for serving sites
npm run build:web-site

# Compile Site API
npm run dev:build

# Run Site API
npm run dev:run
```

To automatically re-compile and run in development, install cargo-watch:
```bash
# Install Cargo watch
cargo install cargo-watch
```

Run the development build in watch mode:
```bash
npm run dev:watch
```

### Build for Docker

It can be useful to build for other architectures, for example when running on an ARM Mac in Docker with Linux (Alpine/Debian/etc base image).

```bash
# Install linker for linux/gnu
brew tap messense/macos-cross-toolchains
brew install aarch64-unknown-linux-gnu

# Add Rust toolchain target
rustup target add aarch64-unknown-linux-gnu

# Build for aarch64
npm run dev:build-aarch
```

## Optimize dependencies

Search for unused dependencies in an app:

```bash
# Make sure the nighly toolchain is installed
rustup install nightly

# Install cargo-udeps
cargo install cargo-udeps

# Check all projects
cd backend
cargo +nightly udeps

# Check the Site API
cd site-api
cargo +nightly udeps
```
