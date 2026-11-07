"""Headless runner: blender -b --factory-startup --python scripts/blender/run.py -- <asset.py> [<asset.py> ...]
Builds each asset into its own PN_* collection and exports it to public/models/."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
for asset in sys.argv[sys.argv.index("--") + 1:]:
    ns = {}
    for f in ("pn_common.py", asset):
        p = os.path.join(HERE, f)
        exec(compile(open(p).read(), p, "exec"), ns)
    print(f"== {asset}")
    ns["build"]()
