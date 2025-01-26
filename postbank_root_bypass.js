/*
 * Script written by Thomas Okoyo
 * 
 * use command below to run
 * frida -U -l postbank_root_bypass.js -f io.eclectics.rnd.postbank
 * 
 */

Java.perform(function () {
    let getRootFunction = Java.use("ka.b");
    let rootCheckerClass = Java.use("aa.b");
    let anotherRootClass = Java.use("n9.a");
    let isDeviceSecure = Java.use("ka.c");
    let SplashActivity = Java.use("io.eclectics.rnd.postbank.SplashActivity");
    let singletonClass = Java.use("da.b");
    let yetAnotherOne = Java.use("fc.f");




    // Application update bypass
    yetAnotherOne.a.implementation = function () {
        console.log("the forgotten one");
        return false;
    }
    getRootFunction.a.implementation = function () {
        console.log("[-]: Got the root function checker method, returning -1");
        return -1;
    }

    rootCheckerClass.n.implementation = function () {
        console.log("[-]: Ile root checker class")
        return false;
    }

    anotherRootClass.f.implementation = function () {
        console.log("[-]: ile function ya this");
        return false;
    }

    isDeviceSecure.b.implementation = function () {
        console.log("Is device secure class");
        return true;
    }
    /*
    SplashActivity.M.implementation = function () {
        console.log("Application update bypass");
        this.O();
        console.log("Calling next activity");
        return;
    }

    SplashActivity.O.implementation = function () {
        console.log("Calling next activity");

        // call the original method
        this.O();
        return false;
    }

    // Singleton function Override
    singletonClass.a.implementation = function () {
        console.log("Singleton class bypass");
        return false;
    }


    // hook the onCreate method of SplashActivity
    let SplashActivity = Java.use("io.eclectics.rnd.postbank.SplashActivity");
    let PostbankActivity = Java.use("io.eclectics.rnd.postbank.ui.PostBankActivity");
    let singletonClass = Java.use("da.b");
    let tempFile = Java.use("io.eclectics.rnd.postbankapp.TempApp");

    PostbankActivity.onCreate.implementation = function (savedInstanceState) {
        console.log("PostbankActivity onCreate called");

        // Call the original onCreate method
        this.onCreate(savedInstanceState);
    };

    tempFile.onCreate.overload().implementation = function () {
        console.log("Temp file called");
        this.onCreate();

        console.log("On create called");

        console.log("getBaseURL()" + this.getBaseURL());
        console.log("getPublicKey() -> " + this.getPublicKey());
        console.log("getAESAlgorithm() -> " + this.getAESAlgorithm());
        console.log("getAESPadding() -> " + this.getAESPadding());
        console.log("getPinnerURL() -> " + this.getPinnerURL());
        console.log("getPinnerFingerprint -> " + this.getPinnerFingerprint());
        console.log("getAESYEK() -> " + this.getAESYEK());
        console.log("getAESIV() -> " + this.getAESIV());
        console.log("getDevSigValue -> " + this.getDevSigValue());
        console.log("getLvSigValue -> " + this.getLvSigValue())
        return;
    };

    console.log("Listing all methods of: " + SplashActivity);

    Java.enumerateLoadedClasses({
        onMatch: function(className) {
            if (className.includes("ssl") || className.includes("SSL") || className.includes("TrustManager")) {
                console.log("Found class: " + className);
            }
        },
        onComplete: function() {
            console.log("Class search completed");
        }
    });

        // Simcard checker function Override
    simCardCheck.c.implementation = function (context) {
        console.log("Sim card check bypass");
        return true;
    }
     */
});
