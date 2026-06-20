#!/usr/bin/env python3
"""One-shot: migrate libs/shared/* jest -> vitest. Idempotent, verify-before-edit."""
import os, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP = {"util-format"}  # already migrated

VITEST_CONFIG = """import { tsconfigBaseAliases } from 'nx-vue3-vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: tsconfigBaseAliases(__dirname),
  },
  test: {
    globals: true,
    environment: 'node',
    root: __dirname,
    include: ['src/**/*.spec.ts'],
  },
})
"""

def test_block_old(lib):
    return (
        '    "test": {\n'
        '      "executor": "@nx/jest:jest",\n'
        f'      "outputs": ["{{workspaceRoot}}/coverage/libs/shared/{lib}"],\n'
        '      "options": {\n'
        f'        "jestConfig": "libs/shared/{lib}/jest.config.ts",\n'
        '        "passWithNoTests": true\n'
        '      }\n'
        '    }'
    )

def test_block_new(lib):
    return (
        '    "test": {\n'
        '      "executor": "nx:run-commands",\n'
        f'      "outputs": ["{{workspaceRoot}}/coverage/libs/shared/{lib}"],\n'
        '      "options": {\n'
        '        "command": "vitest run --passWithNoTests",\n'
        f'        "cwd": "libs/shared/{lib}"\n'
        '      }\n'
        '    }'
    )

done, misses = [], []
for proj in sorted(glob.glob(os.path.join(ROOT, "libs/shared/*/project.json"))):
    d = os.path.dirname(proj)
    lib = os.path.basename(d)
    if lib in SKIP:
        continue

    # 1) project.json test target
    with open(proj) as f:
        pj = f.read()
    old, new = test_block_old(lib), test_block_new(lib)
    if old in pj:
        with open(proj, "w") as f:
            f.write(pj.replace(old, new))
    elif new not in pj:
        misses.append(f"{lib}: project.json test block not matched")
        continue

    # 2) vitest.config.ts
    with open(os.path.join(d, "vitest.config.ts"), "w") as f:
        f.write(VITEST_CONFIG)

    # 3) tsconfig.spec.json: drop module:commonjs, swap jest types
    spec = os.path.join(d, "tsconfig.spec.json")
    if os.path.exists(spec):
        with open(spec) as f:
            ts = f.read()
        ts = ts.replace('    "module": "commonjs",\n', "")
        ts = ts.replace('["jest", "node"]', '["vitest/globals", "node"]')
        with open(spec, "w") as f:
            f.write(ts)

    # 4) delete jest config
    jc = os.path.join(d, "jest.config.ts")
    if os.path.exists(jc):
        os.remove(jc)

    done.append(lib)

print(f"migrated {len(done)} libs:")
for l in done:
    print("  ", l)
if misses:
    print("MISSES (handle manually):")
    for m in misses:
        print("  ", m)
