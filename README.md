# Frida Scripts Repository

This repository contains Frida scripts used for dynamic instrumentation and runtime analysis of applications. Below, you'll find instructions on how to set up Frida, load the scripts, and execute them effectively.

---

## 📌 Prerequisites

Before using the scripts, ensure you have the following installed:

- [Frida](https://frida.re/) (Dynamic instrumentation toolkit)
- Python 3.x (for running Frida scripts via `frida-python`)
- Target application (the app you want to instrument)
- Root or debugging permissions (depending on the target)

### **Installing Frida**
```sh
pip install frida frida-tools
```
To verify installation:
```sh
frida --version
```

---

## 📂 Repository Structure
```
frida-scripts/
├── scripts/
│   ├── example_script.js
│   ├── another_script.js
│   ├── custom_hooks.js
│   └── ...
└── README.md (if needed)
```

---

## 🚀 Loading & Running a Frida Script

### **1 Connecting to a Device or Emulator**
```sh
frida -U -n <target-app> --no-pause
```
- `-U` → Connects to a USB device
- `-n <target-app>` → Targets a running application by name
- `--no-pause` → Ensures the app does not pause when attaching

### **2 Inject a Script into an Application**
```sh
frida -U -n <target-app> -s scripts/example_script.js
```
### **3 Spawn an Application with a loaded script**
```sh
frida -U -f <target-app> -l example_script.js
```
- `-U` → Connects to a USB device
- `-f <target-app>` → Targets an installed application by packagename
- `-l` → Loads the script

---

## 🛠️ Troubleshooting

- **Frida Not Detecting the App?** → Try `frida-ps -U` to list running apps.
- **Script Errors?** → Run with `-v` for verbose output.
- **Permission Issues?** → Ensure the device is rooted (for certain apps).

---

## 📢 Contributions & Support
Feel free to contribute scripts or report issues that arise! If you have any questions, reach out to chatGpt before you ask.

Happy hacking! 🚀
