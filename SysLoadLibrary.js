Java.perform(function () {
    let System = Java.use("");

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

            let result = this.loadLibrary("system");
            return;
        } 
    };
});