// gets the runtime overloads used
Java.perform(function () {
    var packageManager = Java.use("android.content.pm.PackageManager");
    var PackageManager = Java.use("android.app.ApplicationPackageManager");
    var Application = Java.use("android.app.Application");

    PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(packageName, flags) {
        console.log("[-] getPackageInfo called with package: " + packageName);

        // You can modify the behavior or arguments here if needed
        return this.getPackageInfo(packageName, flags); // Calls the original implementation
    };
    
    PackageManager.getPackageInfo.overload("java.lang.String", "int").implementation = function (packageName, flags) {


        console.log("[-]: PackageManager.getPackageInfo() call intercepted. Package Name: ");

        console.log("got it here...");
    };
    
    console.log("done");
});

