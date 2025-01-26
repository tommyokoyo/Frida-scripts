Java.perform(function () {
    var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
    var X509TrustManager = Jave.use('javax.net.ssl.X509TrustManager');
    var CertificatePinner = Java.use('okhttp3.CertificatePinner');
    var SSLContext = Java.use('javax.net.ssl.SSLContext');
    var HostnameVerifier = Java.use('javax.net.ssl.HostnameVerifier');

    // Hook SSLContext init method
    SSLContext.init.overload('[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom').implementation = function (keyManager, trustManager, secureRandom) {
        console.log("[-] SSLContext init called,, replacing TrustManager");

        // custom TrustManager
        var TrustManager = Java.registerClass({
            name: 'CustomTrustManager',
            implements: [X509TrustManager],
            methods: {
                checkClientTrusted: function (chain, authType) {
                    console.log("[-] checkClientTrusted function called: Allowing all clients");
                },
                checkServerTrusted: function (chain, authType) {
                    console.log("[-] checkServerTrusted function called: Allowing all servers");
                },
                getAcceptedIssuers: function () {
                    console.log("[-] getAcceptedIssuers function called: Returning an empty array");
                    return [];
                },
            }
        });

        // Replace the TrustManager with custom
        var customTrustManager = [TrustManager.$new()];

        // call the init with the customTrustManager
        this.init(keyManager, customTrustManager, secureRandom);
    };

    // Hook the CertificatePinner check method
    CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function (hostName, peerCertificates) {
        console.log("[-] CertificatePinner check method called: Bypassing check for " + hostName);
        
        // skip pin validation
        return;
    };

    console.log("[-] SSL Pinning bypass complete...");

});