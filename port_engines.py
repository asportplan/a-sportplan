import os

web_engine_dir = "/Users/alifindra/Documents/Aplikasi Alip/precisetrain-monorepo/apps/web/src/core/engine/"
api_engine_dir = "/Users/alifindra/Documents/Aplikasi Alip/precisetrain-monorepo/apps/api/src/engine/"

files_to_port = [
    "intensity-calculator.js",
    "load-safety.js",
    "training-age-modifier.js",
    "overload-deload.js",
    "session-builder.js",
    "master-data.js"
]

for f in files_to_port:
    src_path = os.path.join(web_engine_dir, f)
    dst_path = os.path.join(api_engine_dir, f.replace(".js", ".ts"))
    
    # Check if files exist
    if not os.path.exists(src_path):
        print(f"Skipping {f}, not found in web app")
        continue

    with open(src_path, 'r') as file:
        content = file.read()
    
    # Basic TS conversions for JSDoc / exports
    content = content.replace("export const ", "export const ")
    content = content.replace("export function ", "export function ")
    content = content.replace("module.exports =", "export default")
    
    # We might need to manually fix types later but this copies them with a .ts extension.
    with open(dst_path, 'w') as file:
        file.write(content)

print("Engine files copied to TS")
