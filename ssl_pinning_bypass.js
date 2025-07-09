Java.perform(function () {
    // === OpenSSLSocketImpl (Conscrypt) ===
    try {
        const OpenSSLSocketImpl = Java.use("com.android.org.conscrypt.OpenSSLSocketImpl");
        OpenSSLSocketImpl.verifyCertificateChain.implementation = function (certChain, authMethod) {
            console.log("[+] Bypassed OpenSSLSocketImpl.verifyCertificateChain");
            return; 
        };
    } catch (err) {
        console.log("[-] OpenSSLSocketImpl not found");
    }

    // === X509TrustManager ===
    try {
        const TrustManager = Java.use("javax.net.ssl.X509TrustManager");
        const methods = ['checkServerTrusted', 'checkClientTrusted'];
        methods.forEach(function (method) {
            TrustManager[method].overload('[Ljava.security.cert.X509Certificate;', 'java.lang.String').implementation = function (chain, authType) {
                console.log(`[+] Bypassed X509TrustManager.${method}`);
                return;
            };
        });
    } catch (err) {
        console.log("[-] X509TrustManager hook failed");
    }

    // === SSLContext.init ===
    try {
        const SSLContext = Java.use("javax.net.ssl.SSLContext");
        SSLContext.init.overload(
            '[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom'
        ).implementation = function (km, tm, sr) {
            console.log("[+] Hooked SSLContext.init()");
            var TrustManagers = tm;
            if (tm === null || tm.length === 0) {
                TrustManagers = tm;
            } else {
                var TrustManagerImpl = Java.registerClass({
                    name: 'com.example.CustomTrustManager',
                    implements: [Java.use('javax.net.ssl.X509TrustManager')],
                    methods: {
                        checkClientTrusted: function (chain, authType) { },
                        checkServerTrusted: function (chain, authType) { },
                        getAcceptedIssuers: function () { return []; }
                    }
                });
                TrustManagers = [TrustManagerImpl.$new()];
            }
            return this.init(km, TrustManagers, sr);
        };
    } catch (err) {
        console.log("[-] SSLContext hook failed");
    }

    // === HostnameVerifier ===
    try {
        const HV = Java.use("javax.net.ssl.HttpsURLConnection");
        HV.setDefaultHostnameVerifier.implementation = function (verifier) {
            console.log("[+] Overriding HostnameVerifier");
            var NoopHostnameVerifier = Java.registerClass({
                name: 'com.example.NoopHostnameVerifier',
                implements: [Java.use('javax.net.ssl.HostnameVerifier')],
                methods: {
                    verify: function (hostname, session) { return true; }
                }
            });
            this.setDefaultHostnameVerifier(NoopHostnameVerifier.$new());
        };
    } catch (err) {
        console.log("[-] HostnameVerifier hook failed");
    }

    // === OkHttp CertificatePinner (if the app uses OkHttp) ===
    try {
        const CertPinner = Java.use("okhttp3.CertificatePinner");
        CertPinner.check.overload('java.lang.String', 'java.util.List').implementation = function (hostname, peerCertificates) {
            console.log("[+] Bypassed OkHttp CertificatePinner.check()");
            return;
        };
    } catch (err) {
        console.log("[-] OkHttp CertificatePinner not found");
    }
});

// === Native OpenSSL Hooks (BoringSSL/libssl.so) ===
const native_hooks = [
    "SSL_get_peer_certificate",
    "SSL_get_verify_result",
    "SSL_write",
    "SSL_read"
];

native_hooks.forEach(func => {
    try {
        const addr = Module.findExportByName(null, func);
        if (addr) {
            Interceptor.attach(addr, {
                onEnter: function (args) {
                    console.log(`[+] Native call: ${func}`);
                    if (func === "SSL_write") {
                        const len = args[2].toInt32();
                        try {
                            let plaintext = Memory.readUtf8String(args[1], len);
                            console.log(`    SSL_write plaintext (${len} bytes):\n${plaintext}`);
                        } catch (e) {
                            console.log(`    SSL_write data (non-text, length=${len}):\n${hexdump(args[1], { length: len })}`);
                        }
                    }
                    if (func === "SSL_read") {
                        this.buf = args[1];
                        this.len = args[2].toInt32();
                    }
                },
                onLeave: function (retval) {
                    if (func === "SSL_read" && retval.toInt32() > 0) {
                        try {
                            let plaintext = Memory.readUtf8String(this.buf, retval.toInt32());
                            console.log(`    SSL_read plaintext (${retval.toInt32()} bytes):\n${plaintext}`);
                        } catch (e) {
                            console.log(`    SSL_read data (non-text, length=${retval.toInt32()}):\n${hexdump(this.buf, { length: retval.toInt32() })}`);
                        }
                    }
                }
            });
        } else {
            console.log(`[-] ${func} not found`);
        }
    } catch (err) {
        console.log(`[-] Failed to hook ${func}: ${err}`);
    }
});
