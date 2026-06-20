#!/usr/bin/env python3
"""One-shot: migrate libs/frontend/* jest -> vitest. Idempotent, verify-before-edit.

Mirrors tools/migrate-shared-to-vitest.py but for libs/frontend. Handles the
mechanical bits only: project.json test target, tsconfig.spec.json, jest.config.ts
deletion, and vitest.config.ts creation. Setup files and spec `jest.*` edits are
done by hand (see vitest-migration-poc.md).
"""
import os, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Already migrated by hand (POC) — skip.
SKIP = {"data-access-command", "feature-build"}

# Per-lib vitest env + setupFiles. Default is ('node', []).
# happy-dom: libs whose old jest config used jest-localstorage-mock / globals window.
# setupFiles './vitest.setup.ts': libs that had a jest.setup.ts (ported by hand).
CONFIG = {
    "feature-copy-paste": ("happy-dom", ["./vitest.setup.ts"]),
    "feature-render-builder": ("happy-dom", ["./vitest.setup.ts"]),
    "ui-build": ("happy-dom", ["./vitest.setup.ts"]),
    "ui-runtime": ("happy-dom", ["./vitest.setup.ts"]),
    "feature-sites": ("node", ["./vitest.setup.ts"]),
    "util-command-data": ("node", ["./vitest.setup.ts"]),
}


def vitest_config(env, setup_files):
    setup = ""
    if setup_files:
        joined = ", ".join(f"'{s}'" for s in setup_files)
        setup = f"    setupFiles: [{joined}],\n"
    return (
        "import { tsconfigBaseAliases } from 'nx-vue3-vite'\n"
        "import { defineConfig } from 'vitest/config'\n"
        "\n"
        "export default defineConfig({\n"
        "  resolve: {\n"
        "    alias: tsconfigBaseAliases(__dirname),\n"
        "  },\n"
        "  test: {\n"
        "    globals: true,\n"
        f"    environment: '{env}',\n"
        "    root: __dirname,\n"
        "    include: ['src/**/*.spec.ts'],\n"
        f"{setup}"
        "  },\n"
        "})\n"
    )


def pj_executor_old():
    return '      "executor": "@nx/jest:jest",'


def pj_executor_new():
    return '      "executor": "nx:run-commands",'


def pj_options_old(lib):
    return (
        f'        "jestConfig": "libs/frontend/{lib}/jest.config.ts",\n'
        '        "passWithNoTests": true'
    )


def pj_options_new(lib):
    return (
        '        "command": "vitest run --passWithNoTests",\n'
        f'        "cwd": "libs/frontend/{lib}"'
    )


done, misses = [], []
for proj in sorted(glob.glob(os.path.join(ROOT, "libs/frontend/*/project.json"))):
    d = os.path.dirname(proj)
    lib = os.path.basename(d)
    if lib in SKIP:
        continue
    # Only migrate libs that still have a jest.config.ts (a jest test target).
    if not os.path.exists(os.path.join(d, "jest.config.ts")):
        continue

    env, setup_files = CONFIG.get(lib, ("node", []))

    # 1) project.json test target
    with open(proj) as f:
        pj = f.read()
    if pj_executor_old() in pj:
        pj = pj.replace(pj_executor_old(), pj_executor_new())
    elif pj_executor_new() not in pj:
        misses.append(f"{lib}: project.json executor not matched")
        continue
    if pj_options_old(lib) in pj:
        pj = pj.replace(pj_options_old(lib), pj_options_new(lib))
    elif pj_options_new(lib) not in pj:
        misses.append(f"{lib}: project.json options block not matched")
        continue
    with open(proj, "w") as f:
        f.write(pj)

    # 2) vitest.config.ts
    with open(os.path.join(d, "vitest.config.ts"), "w") as f:
        f.write(vitest_config(env, setup_files))

    # 3) tsconfig.spec.json: drop module:commonjs, swap jest types
    spec = os.path.join(d, "tsconfig.spec.json")
    if os.path.exists(spec):
        with open(spec) as f:
            ts = f.read()
        ts = ts.replace('    "module": "commonjs",\n', "")
        ts = ts.replace('["jest", ', '["vitest/globals", ')
        with open(spec, "w") as f:
            f.write(ts)

    # 4) delete jest config
    os.remove(os.path.join(d, "jest.config.ts"))

    done.append(lib)

print(f"migrated {len(done)} libs:")
for l in done:
    print("  ", l)
if misses:
    print("MISSES (handle manually):")
    for m in misses:
        print("  ", m)
