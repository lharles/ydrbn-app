import os

OUTPUT_FILE = "consolidated_repo.txt"
EXCLUDED_DIRS = {".git", ".github", "node_modules", "venv", "pycache"}
ALLOWED_EXTENSIONS = {".py", ".js", ".ts", ".md", ".json", ".html", ".css", ".yaml", ".yml"}

def main():
with open(OUTPUT_FILE, "w", encoding="utf-8") as outfile:
for root, dirs, files in os.walk("."):
dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
for file in files:
ext = os.path.splitext(file)[1]
if ext in ALLOWED_EXTENSIONS and file != OUTPUT_FILE:
path = os.path.join(root, file)
outfile.write(f"\n\n--- FILE: {path} ---\n\n")
try:
with open(path, "r", encoding="utf-8") as infile:
outfile.write(infile.read())
except Exception as e:
outfile.write(f"[Error reading file: {e}]")

if name == "main":
main()
