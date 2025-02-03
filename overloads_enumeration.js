Java.perform(function () {
    console.log("Checking if classes exist...");
    try {
        let SSLContext = Java.use('javax.net.ssl.SSLContext');
        console.log("SSLContext exists!");
    } catch (e) {
        console.log("SSLContext does NOT exist in this app!");
    }

    try {
        let CertificatePinner = Java.use("okhttp3.CertificatePinner");
        console.log("CertificatePinner exists!");
    } catch (e) {
        console.log("CertificatePinner does NOT exist in this app!");
    }
});
