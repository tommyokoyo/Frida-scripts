/*
    author: Thomas Okoyo
    use: frida -U -l universal-rootbypass.js -f "package-name"
*/

Java.perform(function() {
    let RunTime = Java.use("java.lang.Runtime");
    let PackageManager = Java.use("android.app.ApplicationPackageManager");
    let File = Java.use("java.io.File");
    let String = Java.use("java.lang.String");
    let System = Java.use("java.lang.System");
    const SystemProperties = Java.use("android.os.SystemProperties");


                            /*-- Variables--*/
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

    var RootBinaries = ["su",
        "busybox", "supersu",
        "Superuser.apk", "KingoUser.apk",
        "SuperSu.apk", "magisk", "getprop"
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
        "ro.debuggable": "0",
        "service.adb.root": "0",
        "ro.secure": "1"
    };

    let commands = ["su", "getprop", "mount", "build.prop", "id", "which su"];

    let DangerousPropsKeys = [];

    for (let propKey in DangerousProps) DangerousPropsKeys.push(propKey);


    /*-- System Properties check--*/
    SystemProperties.get.overload("java.lang.String").implementation = function(name) {
        console.log("[-] SystemProperties call intercepted: " + name);
        if (DangerousPropsKeys.includes(name)) {
            console.log("[-] SystemProperties " + name + " was called");
            return DangerousProps[name];
        }
        return this.get.overload("java.lang.String").call(this, name);
    };

    /*-- Native File Detection--*/
    Interceptor.attach(Module.findExportByName("libc.so", "fopen"), {
        onEnter: function(args) {
            // args[0] is the args passes (char *fname)
            let filePath = Memory.readCString(args[0]);

            let suknownPaths = knownPaths.map(path => path = path + "su");
            let busyboxknownPaths = knownPaths.map(path => path = path + "busybox");
            let magiskKnowPaths = knownPaths.map(path => path = path + "magisk");

            console.log("[-] fopen called on path: " + filePath + " with: " + args[1]);

            // Modify the path if it matches
            if (suknownPaths.includes(filePath) || busyboxknownPaths.includes(filePath) || magiskKnowPaths.includes(filePath)) { //place holder for file seraching
                console.log("[-] Returning TRUE");
                this.shouldReturnNull = true;
            }
        },
        onLeave: function(retval) {
            if (this.shouldReturnNull) {
                console.log("Returning NULL for fopen()");
                retval.replace(ptr(0));
            }
        }
    });

    Interceptor.attach(Module.findExportByName("libc.so", "system"), {
        onEnter: function (args) {
            let commandPassed = Memory.readCString(args[0]);
            send("[-] Command retrieved is: " + commandPassed);
            if (commands.includes(commandPassed)) {
                send("[-] Bypassing native system: " + cmd);
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

        console.log("[-] File.exist method called on: " + pathFetched);

        if (suknownPaths.includes(pathFetched) || busyboxknownPaths.includes(pathFetched) || magiskKnowPaths.includes(pathFetched)) {
            console.log("[-] Bypassing File fetch on: " + pathFetched);
            return false;
        } else {
            console.log("[-] File.exists() proceed on: " + pathFetched);
            return this.exists.call(this);
        }
    };

    // Throw an NameNotFoundException when one searches for root packages 
    PackageManager.getPackageInfo.implementation = function (packageName, flags) {
        console.log("[-]: PackageManager.getPackageInfo() call intercepted. Package Name: " + packageName);

        if (RootPackages.includes(packageName)) {
            console.log("[-]: Throwing exception for matching package: " + packageName);
            return this.getPackageInfo("com.formyhm.hideroot", flags);
        } else {
            return this.getPackageInfo(packageName, flags);
        }
    };
 
    /*-- Binary Detection--*/
    // Hook the Runtime.exec(String cmd)
    RunTime.getRuntime().exec.overload("java.lang.String").implementation = function (command) {
        console.log("[-] Runtime.exec(cmd) called with: " + command);

        if (commands.includes(command)) {
            console.log("[-] Returning a dummy process to bypass");

            return this.exec("ls");
        }

        return this.exec(command);
    };

    // Hook the Runtime.exec(String cmdArray[])
    RunTime.getRuntime().exec.overload("[Ljava.lang.String;").implementation = function (cmdarray) {
        let commandArray = cmdarray.join(" ");

        console.log("[-] Runtime.exec(cmdArray) called with: " + cmdarray.join(" "));


        if (commands.includes(commandArray)) {
            console.log("[-] Returning a dummy process to bypass");

            return this.exec("ls");
        }

        return this.exec(commandArray);
    };

    // Hook the Runtime.exec(String command, String[] envp)
    RunTime.getRuntime().exec.overload("java.lang.String", "[Ljava.lang.String;").implementation = function(command, envp) {
        console.log("[-] Runtime.exec(cmdArray) called with: " + command);
        n
        // Check if envp is null
        if (envp === null) {
        } else {
            console.log("[-] envp: " + envp.join(" "));
        }

        if (commands.includes(command)) {
            console.log("[-] Returning a dummy process to bypass");

            return this.exec("ls");        
        }
        
        return this.exec(command, envp);
    };

    // Hook the Runtime.exec(String[] command, String[] envp)
    RunTime.getRuntime().exec.overload("[Ljava.lang.String;", "[Ljava.lang.String;").implementation = function(cmdArray, envp) {
        let commandArray = cmdarray.join(" ");
        console.log("[-] Runtime.exec(cmdArray) called with: " + cmdarray.join(" "));

        // Check if envp is null
        if (envp === null) {
        } else {
            console.log("[-] envp: " + envp.join(" "));
        }

        if (commands.includes(commandArray)) {
            console.log("[-] Returning a dummy process to bypass");

            return this.exec("ls");        
        }

        return this.exec(cmdArray, envp);
    };

    // Hook the Runtime.exec(String command, String[] envp, File file)
    RunTime.getRuntime().exec.overload("java.lang.String", "[Ljava.lang.String;", "java.io.File").implementation = function(command, envp, dir) {
        // Check if envp is null
        if (envp === null) {
        } else {
            console.log("[-] envp: " + envp.join(" "));
        }
        console.log("[-] Runtime.exec(String command, String[] envp, File file) called with: " + command);
        
        return this.exec(command, envp, dir);
    };

    // Hook the Runtime.exec(String[] command, String[] envp, File file)
    RunTime.getRuntime().exec.overload("[Ljava.lang.String;", "[Ljava.lang.String;", "java.io.File").implementation = function(cmdarray, envp, dir) {
        // Check if envp is null
        if (envp === null) {
        } else {
            console.log("[-] envp: " + envp.join(" "));
        }
        console.log("[-] Runtime.exec(String[] command, String[] envp, File file) called with: " + cmdarray.join(" "));
        
        return this.exec(cmdarray, envp, dir);
    };

    /*-- Test-Keys Detection--*/
    String.contains.implementation = function (strContent) {
        console.log("[-] String contains class method called with: " + strContent);

        if (knownStrings.includes(strContent) && knownStrings === 'test-keys') {
            // check if string is among listed
            console.log("[-] Returning false for String.contains(): " + strContent);

            return false;
        } else {
            // call original methods
            return this.contains.call(this, strContent);
        }
    }

    SystemProperties.get.overload('java.lang.String').implementation = function (name) {
        if (DangerousPropsKeys.includes(name)) {
            send("[-] checking for: ", name);
            return DangerousProps[name];
        }
        return this.get.call(this, name);
    };
    /*
    System.loadLibrary.implementation = function(libraryName) {
        console.log("[-] System.loadLibray() call intercepted with: " + libraryName);

        // Attempt to load library (need to be reviewed)
        try{
            let result = this.loadLibrary(libraryName);

            console.log("Library loaded successfuly");
            return result;
        } catch (e) {
            console.log("[-] Failed to load library: " + libraryName);
            console.log("[-] Loading a different library...");

            // let result = this.loadLibrary("system");

            // skip error and return nothing
            return;
        } 
    };
    */
});
