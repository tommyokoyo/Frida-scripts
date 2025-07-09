Java.perform(function () {
    const Request = Java.use('com.android.okhttp.Request');
    const RequestBody = Java.use('com.android.okhttp.RequestBody');
    const Buffer = Java.use('com.android.okhttp.okio.Buffer');
    const CertificatePinner = Java.use('com.android.okhttp.CertificatePinner');

    const RequestBuilder = Java.use('com.android.okhttp.Request$Builder');

    // Intercept build() of Request.Builder
    RequestBuilder.build.implementation = function () {
        const req = this.build();
        const url = req.url().toString();
        const method = req.method();
        const headers = req.headers();

        console.log("\n==== [OkHttp Request Intercepted] ====");
        console.log("→ URL: " + url);
        console.log("→ Method: " + method);

        if (headers.size() > 0) {
            console.log("→ Headers:");
            for (let i = 0; i < headers.size(); i++) {
                console.log("   " + headers.name(i) + ": " + headers.value(i));
            }
        }

        const body = req.body();
        if (body !== null) {
            try {
                const buffer = Buffer.$new();
                body.writeTo(buffer);
                const charset = Java.use('java.nio.charset.Charset').forName("UTF-8");
                const content = buffer.readString(charset);
                console.log("→ Body:\n" + content);
            } catch (err) {
                console.log("→ [!] Could not dump request body (maybe binary): " + err);
            }
        }

        console.log("=======================================\n");
        return req;
    };

    // Bypass SSL pinning
    CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function (host, peerCertificates) {
        console.log('[+] Bypassing SSL pinning for host: ' + host);
        return;
    };

    console.log("=== [*] OkHttp Interceptor & SSL Pinning Bypass Loaded ===");
});
