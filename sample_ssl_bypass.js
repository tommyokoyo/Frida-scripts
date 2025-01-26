Java.perform(function () {
    console.log("[*] Starting SSL pinning bypass script");

    // Hook into the TrustManager to bypass certificate validation
    var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
    var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');

    X509TrustManager.checkServerTrusted.implementation = function (chain, authType) {
        console.log("[*] Bypassing X509TrustManager checkServerTrusted");
        return;
    };

    TrustManagerImpl.checkServerTrusted.implementation = function (chain, authType, host) {
        console.log("[*] Bypassing TrustManagerImpl checkServerTrusted");
        return;
    };

    // Hook into the SSLContext to replace the default TrustManager with a permissive one
    var SSLContext = Java.use('javax.net.ssl.SSLContext');
    SSLContext.init.overload(
        '[Ljavax.net.ssl.KeyManager;',
        '[Ljavax.net.ssl.TrustManager;',
        'java.security.SecureRandom'
    ).implementation = function (keyManager, trustManager, secureRandom) {
        console.log("[*] Hooking SSLContext.init and using a custom TrustManager");
        this.init(keyManager, null, secureRandom);
    };

    // Bypass HostnameVerifier
    var HostnameVerifier = Java.use('javax.net.ssl.HostnameVerifier');
    HostnameVerifier.verify.implementation = function (hostname, session) {
        console.log("[*] Bypassing HostnameVerifier for: " + hostname);
        return true;
    };

    // Hook OkHttp (if used by the app) to bypass certificate pinning
    try {
        var CertificatePinner = Java.use('okhttp3.CertificatePinner');
        CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function (hostname, peerCertificates) {
            console.log("[*] Bypassing OkHttp CertificatePinner for: " + hostname);
            return;
        };
    } catch (err) {
        console.log("[*] OkHttp CertificatePinner not found");
    }
    
    console.log("[*] SSL pinning bypass script completed");
});
