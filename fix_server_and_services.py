import os
import re

old_src = "/Users/alifindra/Documents/Aplikasi Alip/Aplikasi Beban Latihan  v1/src/"
new_src = "/Users/alifindra/Documents/Aplikasi Alip/precisetrain-monorepo/apps/api/src/"

# Fix server.ts
with open(old_src + "server.ts", 'r') as f:
    content = f.read()

# Replace dotenv.config();
content = content.replace("dotenv.config();", "dotenv.config({ path: '../../.env' });")

# Change express.static(process.cwd()) to serve public/
content = content.replace("app.use(express.static(process.cwd()));", "app.use(express.static('public'));")

with open(new_src + "server.ts", 'w') as f:
    f.write(content)

# Fix services
service_files = ['equipment.service.ts', 'export.service.ts', 'medical.service.ts', 'profile.service.ts', 'program.service.ts', 'workout-log.service.ts']
for f in service_files:
    with open(old_src + "services/" + f, 'r') as fin:
        content = fin.read()
    
    with open(new_src + "services/" + f, 'w') as fout:
        fout.write(content)

print("Done fixing server and services.")
