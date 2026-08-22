import os
import re

routes_dir = "/Users/alifindra/Documents/Aplikasi Alip/precisetrain-monorepo/apps/api/src/routes/"

import_stmt = "import { requireAuth } from '../middleware/auth.middleware.js';\n"

for f in os.listdir(routes_dir):
    if not f.endswith(".ts") or f == "index.ts":
        continue
    
    path = os.path.join(routes_dir, f)
    with open(path, 'r') as file:
        content = file.read()
    
    if "requireAuth" not in content:
        content = import_stmt + content
    
    content = re.sub(r'(router\.(get|post|put|delete|patch)\([\'`"][^\'"`]+[\'`"]\s*,\s*)(?!requireAuth)', r'\1requireAuth, ', content)
    
    with open(path, 'w') as file:
        file.write(content)

print("Routes patched")
