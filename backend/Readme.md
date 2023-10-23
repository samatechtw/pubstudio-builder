# PubStudio Backend

Rust/Cargo workspace for PubStudio Platform API/DB and Site API.

## Environment setup

In development, the backend is built on the host with Cargo. Binaries are cross-compiled and copied into the development cluster. Some tools are needed to achieve this.

```bash
# Install Cargo watch
cargo install cargo-watch

# Install linker for linux/gnu
brew tap messense/macos-cross-toolchains
brew install aarch64-unknown-linux-gnu

# Add Rust toolchain target
rustup target add aarch64-unknown-linux-gnu
```

**Run backend**

```bash
# Compiles all backend apps and rebuilds when files change
npm run dev:watch

# Start development cluster
npm run skaffold
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
