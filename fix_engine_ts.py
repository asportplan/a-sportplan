import os

api_engine_dir = "/Users/alifindra/Documents/Aplikasi Alip/precisetrain-monorepo/apps/api/src/engine/"

# We need to make sure master-data.js imports are changed to master-data.ts in other files
for root, _, files in os.walk(api_engine_dir):
    for f in files:
        if f.endswith('.ts'):
            path = os.path.join(root, f)
            with open(path, 'r') as file:
                content = file.read()
            
            content = content.replace("'../db/master-data.js'", "'./master-data.js'")
            content = content.replace('"../db/master-data.js"', '"./master-data.js"')
            if "master-data.ts" in f:
                content = content.replace("module.exports =", "export default")
            
            with open(path, 'w') as file:
                file.write(content)

print("Imports fixed")
