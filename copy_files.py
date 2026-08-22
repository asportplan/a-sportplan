import os
import shutil
import re

old_src = "/Users/alifindra/Documents/Aplikasi Alip/Aplikasi Beban Latihan  v1/src/"
new_src = "/Users/alifindra/Documents/Aplikasi Alip/precisetrain-monorepo/apps/api/src/"

def copy_and_replace(src_path, dest_path, replacements):
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    with open(src_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(content)

def process_all():
    # Directories to create
    dirs = ['auth', 'db', 'db/schema', 'db/seed', 'engine', 'middleware', 'routes', 'controllers', 'services']
    for d in dirs:
        os.makedirs(os.path.join(new_src, d), exist_ok=True)

    # 1. db/index.ts
    copy_and_replace(old_src + "db/index.ts", new_src + "db/index.ts", [
        ("dotenv.config();", "dotenv.config({ path: '../../.env' });")
    ])

    # 2. Schema
    for f in ['auth.ts', 'equipment.ts', 'index.ts', 'master.ts', 'profiles.ts', 'programs.ts']:
        shutil.copy(old_src + "db/schema/" + f, new_src + "db/schema/" + f)

    # 3. seed.ts
    copy_and_replace(old_src + "db/seed/seed.ts", new_src + "db/seed/seed.ts", [
        ("dotenv.config();", "dotenv.config({ path: '../../../.env' });")
    ])

    # 4. auth/better-auth.ts
    copy_and_replace(old_src + "auth/better-auth.ts", new_src + "auth/better-auth.ts", [
        ("dotenv.config();", "dotenv.config({ path: '../../.env' });")
    ])

    # 5. engines
    for f in ['autoregulation.engine.ts', 'medical-triage.engine.ts', 'multi-focus-slicer.engine.ts', 'mvw-detector.engine.ts', 'substitution.engine.ts']:
        shutil.copy(old_src + "engine/" + f, new_src + "engine/" + f)

    # 6. middleware
    shutil.copy(old_src + "middleware/error.middleware.ts", new_src + "middleware/error.middleware.ts")

    # 7. routes
    for f in ['equipment.router.ts', 'export.router.ts', 'index.ts', 'medical.router.ts', 'profile.router.ts', 'program.router.ts', 'workout-log.router.ts']:
        shutil.copy(old_src + "routes/" + f, new_src + "routes/" + f)

    # 8. controllers
    controller_files = ['equipment.controller.ts', 'export.controller.ts', 'medical.controller.ts', 'profile.controller.ts', 'program.controller.ts', 'workout-log.controller.ts']
    for f in controller_files:
        content = open(old_src + "controllers/" + f).read()
        
        # Replace the test-user-id fallback with proper check
        content = re.sub(r'const userId\s*=\s*\(req as any\)\.user\?\.id\s*\|\|\s*[\'"]test-user-id[\'"];?', 
            "const userId = (req as any).user?.id;\n    if (!userId) {\n      return res.status(401).json({ success: false, error: 'Authentication required' });\n    }", content)
            
        with open(new_src + "controllers/" + f, 'w') as out:
            out.write(content)

    print("Copy completed")

process_all()
