/*
    author: Thomas Okoyo
    use: frida -U -l Rootbypass.js -f "package-name"
*/

Java.perform(function() {
    let RunTime = Java.use("java.lang.Runtime");
    let PackageManager = Java.use("android.app.ApplicationPackageManager");
    let File = Java.use("java.io.File");
    let JavaString = Java.use("java.lang.String");
    const SystemProperties = Java.use("android.os.SystemProperties");

    let RootPackages = [
        "com.topjohnwu.magisk", "eu.chainfire.supersu", "com.noshufou.android.su.elite",
        "com.noshufou.android.su", "com.koushikdutta.superuser", "com.koushikdutta.rommanager", "com.koushikdutta.rommanager.license",
        "com.zachspong.temprootremovejb", "com.ramdroid.appquarantine", "com.dimonvideo.luckypatcher",
        "com.chelpus.lackypatch", "com.android.vending.billing.InAppBillingService.COIN", 
        "com.chelpus.luckypatcher", "com.android.vending.billing.InAppBillingService.COIN",
        "com.android.vending.billing.InAppBillingService.LUCK", "com.chelpus.luckypatcher",
        "com.blackmartalpha", "org.blackmart.market", "com.dv.marketmod.installer", "org.mobilism.android",
        "com.android.wp.net.log", "com.android.camera.update", "cc.madkite.freedom", "com.solohsu.android.edxp.manager",
        "org.meowcat.edxposed.manager", "com.xmodgame", "com.cih.game_cih", "com.charles.lpoqasert", "catch_.me_.if_.you_.can_",
        "com.allinone.free", "com.repodroid.app", "org.creeplays.hack", "com.baseappfull.fwd", "com.zmapp",
        "com.devadvance.rootcloak", "de.robv.android.xposed.installer", "com.thirdparty.superuser",
        "com.yellowes.su", "com.kingroot.kinguser", "com.kingo.root", "com.smedialink.oneclickroot",
        "com.zhiqupk.root.global", "com.alephzain.framaroot", "com.saurik.substrate", "com.amphoras.hidemyroot", "com.amphoras.hidemyrootadfree", "com.formyhm.hiderootPremium", "com.formyhm.hideroot"
    ];

    let knownPaths = [
        "/data/",
        "/data/local/",
        "/data/local/bin/",
        "/data/local/xbin/",
        "/sbin/",
        "/su/bin/",
        "/system/bin/",
        "/system/sbin/",
        "/system/xbin/",
        "/system/bin/.ext/",
        "/system/bin/failsafe/",
        "/system/sd/xbin/",
        "/system/usr/we-need-root/",
        "/vendor/bin/",
        "/cache/",
        "/dev/",
        "/etc/",
    ];

    let knownStrings = [
        "ranchu",
        "test-keys",
        "goldfish",
        "$",
        "sdk"
    ];

    let DangerousProps = {
        "ro.debuggable": "1",
        "ro.secure": "0",
        "ro.build.selinux": "1",
        "service.adb.root": "0",
    };

    let commands = ["su", "getprop", "mount", "build.prop", "id", "which su", "netstat"];

    // Initailizes the prop keys as an array
    let DangerousPropsKeys = [];
    for (let propKey in DangerousProps) DangerousPropsKeys.push(propKey);


    /*-- System Properties check--*/
    SystemProperties.get.overload("java.lang.String").implementation = function(name) {
        if (DangerousPropsKeys.includes(name)) {
            send("Bypassing SystemProperties call on: " + name);
            return DangerousProps[name];
        }

        return this.get.overload("java.lang.String").call(this, name);
    };

    /*-- Native File Detection--*/
    Interceptor.attach(Module.findExportByName("libc.so", "fopen"), {
        onEnter: function(args) {
            let filePath = Memory.readCString(args[0]);
            let suknownPaths = knownPaths.map(path => path = path + "su");
            let busyboxknownPaths = knownPaths.map(path => path = path + "busybox");
            let magiskKnowPaths = knownPaths.map(path => path = path + "magisk");

            if (suknownPaths.includes(filePath) || busyboxknownPaths.includes(filePath) || magiskKnowPaths.includes(filePath)) {
                send("Bypassing fopen syscall on: " + filePath);
                this.shouldReturnNull = true;
            }
        },
        onLeave: function(retval) {
            if (this.shouldReturnNull) {
                retval.replace(ptr(0));
            }
        }
    });

    Interceptor.attach(Module.findExportByName("libc.so", "system"), {
        onEnter: function (args) {
            let commandPassed = Memory.readCString(args[0]);
            if (commands.includes(commandPassed)) {
                send("[-] Bypassing native command check: " + cmd);
                Memory.writeUtf8String(args[0], "grep");
            }
        },
        onLeave: function (retval) {}
    });

    /*-- File Detection--*/
    File.exists.implementation = function() {
        let pathFetched = this.getAbsolutePath();
        let suknownPaths = knownPaths.map(path => path = path + "su");
        let busyboxknownPaths = knownPaths.map(path => path = path + "busybox");
        let magiskKnowPaths = knownPaths.map(path => path = path + "magisk");

        if (suknownPaths.includes(pathFetched) || busyboxknownPaths.includes(pathFetched) || magiskKnowPaths.includes(pathFetched)) {
            send("Bypassing File exists() check on: " + pathFetched);
            return false;
        } else {
            return this.exists.call(this);
        }
    };

    // Checks for calls to the getPackageInfo() method 
    PackageManager.getPackageInfo.implementation = function (packageName, flags) {
        if (RootPackages.includes(packageName)) {
            send("bypassing getPackageInfo() for: " + packageName);
            return this.getPackageInfo("com.okoyo.sample.packagename", flags);
        } else {
            return this.getPackageInfo(packageName, flags);
        }
    };
 
    /*-- Binary Detection--*/
    // Hook the Runtime.exec(String cmd)
    RunTime.getRuntime().exec.overload("java.lang.String").implementation = function (command) {
        send("[-] Runtime.exec(cmd) called with: " + command);

        if (commands.includes(command)) {
            send("Bypassing Runtime.exec(String cmd) with: ls");
            return this.exec("ls");
        }

        return this.exec(command);
    };

    // Hook the Runtime.exec(String cmdArray[])
    RunTime.getRuntime().exec.overload("[Ljava.lang.String;").implementation = function (cmdarray) {
        let commandArray = cmdarray.join(" ");
        send("Runtime.exec(cmdArray) called with: " + commandArray);

        if (commands.includes(commandArray)) {
            send("Bypassing Runtime.exec(String cmdArray[]) with: ls");
            return this.exec("ls");
        }

        return this.exec(commandArray);
    };

    // Hook the Runtime.exec(String command, String[] envp)
    RunTime.getRuntime().exec.overload("java.lang.String", "[Ljava.lang.String;").implementation = function(command, envp) {
        send("Runtime.exec(String command, String[] envp) called with: " + command);
        
        if (envp !== null) {
            send("Runtime.exec(String command, String[] envp) called with: " + envp.join(" "));
        }

        if (commands.includes(command)) {
            send("Bypassing Runtime.exec(String command, String[] envp) with: ls");
            return this.exec("ls");        
        }  

        return this.exec(command, envp);
    };

    // Hook the Runtime.exec(String[] command, String[] envp)
    RunTime.getRuntime().exec.overload("[Ljava.lang.String;", "[Ljava.lang.String;").implementation = function(cmdArray, envp) {
        let commandArray = cmdarray.join(" ");
        send("Runtime.exec(String[] command, String[] envp) called with: " + commandArray);

        if (envp !== null) {
            send("envp: " + envp.join(" "));
        }

        if (commands.includes(commandArray)) {
            send("Bypassing Runtime.exec(String[] command, String[] envp) with: ls");
            return this.exec("ls");        
        }

        return this.exec(cmdArray, envp);
    };

    // Hook the Runtime.exec(String command, String[] envp, File file)
    RunTime.getRuntime().exec.overload("java.lang.String", "[Ljava.lang.String;", "java.io.File").implementation = function(command, envp, dir) {
        if (envp !== null) {
            send("envp: " + envp.join(" "));
        }
        console.log("Runtime.exec(String command, String[] envp, File file) called with: " + command);
        
        return this.exec(command, envp, dir);
    };

    // Hook the Runtime.exec(String[] command, String[] envp, File file)
    RunTime.getRuntime().exec.overload("[Ljava.lang.String;", "[Ljava.lang.String;", "java.io.File").implementation = function(cmdarray, envp, dir) {
        if (envp !== null) {
            send("envp: " + envp.join(" "));
        }
        send("Runtime.exec(String[] command, String[] envp, File file) called with: " + cmdarray.join(" "));
        
        return this.exec(cmdarray, envp, dir);
    };

    /*-- Test-Keys Detection--*/
    JavaString.contains.implementation = function (strContent) {
        if (knownStrings.includes(strContent)) {
            send("Bypassing String.contains() on: " + strContent);
            return false;
        } else {
            return this.contains.call(this, strContent);
        }
    }

    SystemProperties.get.overload('java.lang.String').implementation = function (name) {
        if (DangerousPropsKeys.includes(name)) {
            send("Bypassing Prop check for: ", name);
            return DangerousProps[name];
        }
        
        return this.get.call(this, name);
    };
});
