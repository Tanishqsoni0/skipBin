import os

IMPORTANT = {
    "backend",
    "database",
    "frontend"
}

with open("structure.txt", "w", encoding="utf-8") as f:

    def walk(path, level=0):

        for item in sorted(os.listdir(path)):

            full = os.path.join(path, item)

            if level == 0 and item not in IMPORTANT:
                continue

            if os.path.isdir(full):

                if item in {
                    "venv",
                    ".venv",
                    "node_modules",
                    "__pycache__",
                    ".git"
                }:
                    continue

                f.write("    "*level + f"[{item}]\n")

                walk(full, level+1)

            else:

                ext = os.path.splitext(item)[1]

                if ext in {
                    ".py",
                    ".js",
                    ".jsx",
                    ".css",
                    ".json",
                    ".sql"
                }:
                    f.write(
                        "    "*(level+1)
                        + item
                        + "\n"
                    )

    walk(".")