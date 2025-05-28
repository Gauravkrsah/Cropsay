import importlib.util
import sys

def check_package(package_name):
    spec = importlib.util.find_spec(package_name)
    if spec is None:
        print(f"Package {package_name} is NOT installed")
        return False
    else:
        print(f"Package {package_name} is installed")
        return True

# List of packages to check
packages = [
    "fastapi",
    "uvicorn",
    "transformers",
    "torch",
    "numpy",
    "scikit-learn",
    "pydantic",
    "re"
]

# Check each package
all_installed = True
for package in packages:
    if not check_package(package):
        all_installed = False

if all_installed:
    print("\nAll required packages are installed!")
else:
    print("\nSome packages are missing. Please install them using:")
    print("pip install fastapi uvicorn transformers torch scikit-learn numpy pydantic")

# Print Python executable path
print(f"\nPython executable: {sys.executable}")