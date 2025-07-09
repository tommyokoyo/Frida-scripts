Java.perform(function () {
    console.log("=== [*] Installing network hooks... ===");

    // ========== 1. HttpURLConnection ==========
    try {
        const URL = Java.use("java.net.URL");
        URL.openConnection.overload().implementation = function () {
            const conn = this.openConnection();
            console.log("[URL.openConnection()] → " + this.toString());
            return conn;
        };
        console.log("[+] Hooked java.net.URL.openConnection");
    } catch (err) {
        console.log("[-] Error hooking HttpURLConnection: " + err);
    }

    // ========== 2. com.android.okhttp (Android 7) ==========
    try {
        const RequestBuilder = Java.use('com.android.okhttp.Request$Builder');
        const RequestBody = Java.use('com.android.okhttp.RequestBody');
        const Buffer = Java.use('com.android.okhttp.okio.Buffer');
        const Charset = Java.use("java.nio.charset.Charset");

        RequestBuilder.build.implementation = function () {
            const request = this.build();
            console.log("\n[OkHttp (AOSP)] → " + request.method() + " " + request.url());

            const headers = request.headers();
            for (let i = 0; i < headers.size(); i++) {
                console.log("  ↪ " + headers.name(i) + ": " + headers.value(i));
            }

            const body = request.body();
            if (body) {
                try {
                    const buffer = Buffer.$new();
                    body.writeTo(buffer);
                    const charset = Charset.forName("UTF-8");
                    const content = buffer.readString(charset);
                    console.log("  ↪ Body: " + content);
                } catch (e) {
                    console.log("  ↪ [!] Error reading body");
                }
            }

            return request;
        };

        // Bypass SSL Pinning (com.android.okhttp)
        const CertPinner = Java.use("com.android.okhttp.CertificatePinner");
        CertPinner.check.overload("java.lang.String", "java.util.List").implementation = function (host, certs) {
            console.log("[+] Bypassed CertificatePinner for host: " + host);
        };

        console.log("[+] Hooked com.android.okhttp + SSL bypass");
    } catch (err) {
        console.log("[-] Error hooking com.android.okhttp: " + err);
    }

    // ========== 3. OkHttp3 ==========
    try {
        const OkHttpRequestBuilder = Java.use('okhttp3.Request$Builder');
        OkHttpRequestBuilder.build.implementation = function () {
            const req = this.build();
            console.log("\n[OkHttp3] → " + req.method() + " " + req.url());

            const headers = req.headers();
            for (let i = 0; i < headers.size(); i++) {
                console.log("  ↪ " + headers.name(i) + ": " + headers.value(i));
            }

            const body = req.body();
            if (body) {
                const Buffer = Java.use('okio.Buffer');
                const buffer = Buffer.$new();
                body.writeTo(buffer);
                console.log("  ↪ Body: " + buffer.readUtf8());
            }

            return req;
        };

        const OkHttpPinner = Java.use("okhttp3.CertificatePinner");
        OkHttpPinner.check.overload("java.lang.String", "java.util.List").implementation = function (host, peerCertificates) {
            console.log("[+] Bypassed okhttp3.CertificatePinner for host: " + host);
        };

        console.log("[+] Hooked okhttp3 + SSL bypass");
    } catch (err) {
        console.log("[-] OkHttp3 not found or obfuscated: " + err);
    }

    // ========== 4. Apache HttpClient ==========
    try {
        const HttpClient = Java.use("org.apache.http.impl.client.DefaultHttpClient");
        const HttpPost = Java.use("org.apache.http.client.methods.HttpPost");

        HttpClient.execute.overload("org.apache.http.client.methods.HttpUriRequest").implementation = function (req) {
            console.log("\n[Apache HttpClient] → " + req.getMethod() + " " + req.getURI().toString());
            return this.execute(req);
        };

        console.log("[+] Hooked Apache HttpClient");
    } catch (err) {
        console.log("[-] Apache HttpClient not found: " + err);
    }

    // ========== 5. Volley ==========
    try {
        const StringRequest = Java.use("com.android.volley.toolbox.StringRequest");

        StringRequest.getParams.implementation = function () {
            const params = this.getParams();
            console.log("\n[Volley] Request params:");
            const iterator = params.entrySet().iterator();
            while (iterator.hasNext()) {
                const entry = iterator.next();
                console.log("  ↪ " + entry.getKey() + ": " + entry.getValue());
            }
            return params;
        };

        StringRequest.getUrl.implementation = function () {
            const url = this.getUrl();
            console.log("[Volley] → URL: " + url);
            return url;
        };

        console.log("[+] Hooked Volley StringRequest");
    } catch (err) {
        console.log("[-] Volley not found: " + err);
    }

    console.log("=== [✓] All available network hooks loaded ===");
});
