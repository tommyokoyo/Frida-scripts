Java.perform(function () {
    console.log("=== [*] Starting Combined Network Hooks ===");

    // ----------- Apache HttpClient Hooks -----------

    try {
        const HttpClient = Java.use("org.apache.http.impl.client.DefaultHttpClient");
        const HttpPost = Java.use("org.apache.http.client.methods.HttpPost");
        const URI = Java.use("java.net.URI");

        HttpClient.execute.overload('org.apache.http.client.methods.HttpUriRequest').implementation = function (request) {
            console.log("\n[Apache HttpClient] Executing request to: " + request.getURI());

            const headers = request.getAllHeaders();
            for (let i = 0; i < headers.length; i++) {
                console.log("[Header] " + headers[i].getName() + ": " + headers[i].getValue());
            }

            return this.execute(request);
        };

        const HttpEntity = Java.use("org.apache.http.entity.AbstractHttpEntity");

        HttpEntity.writeTo.implementation = function (outputStream) {
            console.log("[Apache HttpClient] Writing HTTP entity body...");

            // Create a buffer to capture the written data
            const ByteArrayOutputStream = Java.use("java.io.ByteArrayOutputStream");
            const baos = ByteArrayOutputStream.$new();
            this.writeTo(baos);
            const data = baos.toString("UTF-8");
            console.log("[Body] " + data);

            return this.writeTo(outputStream); // Call original
        };

        console.log("[✓] Apache HttpClient hooks installed");
    } catch (err) {
        console.log("[!] Apache HttpClient not found: " + err);
    }

    // ----------- Android System OkHttp Hooks (com.android.okhttp.*) -----------

    try {
        const RequestBody = Java.use("com.android.okhttp.RequestBody");
        const Buffer = Java.use("com.android.okhttp.okio.Buffer");

        RequestBody.writeTo.implementation = function (sink) {
            console.log("\n[OkHttp] Detected RequestBody.writeTo");

            const buffer = Buffer.$new();
            this.writeTo(buffer);
            const content = buffer.readUtf8();
            console.log("[OkHttp Body] " + content);

            return this.writeTo(sink); // Continue with original call
        };

        console.log("[✓] OkHttp (Android built-in) hook installed");
    } catch (err) {
        console.log("[!] com.android.okhttp.* not found: " + err);
    }

    // ----------- Firebase Crashlytics Internal HTTP -----------

    try {
        const FirebaseFactory = Java.use("com.google.firebase.crashlytics.internal.network.HttpRequestFactory");

        FirebaseFactory.buildHttpRequest.overload('java.lang.String', 'java.lang.String', 'java.util.Map')
            .implementation = function (method, url, headers) {
                console.log(`\n[Firebase] buildHttpRequest(): ${method} ${url}`);
                const headerSet = headers.entrySet().toArray();
                for (let i = 0; i < headerSet.length; i++) {
                    const entry = headerSet[i];
                    console.log("[Header] " + entry.getKey() + ": " + entry.getValue());
                }

                return this.buildHttpRequest(method, url, headers);
            };

        console.log("[✓] Firebase Crashlytics network hook installed");
    } catch (err) {
        console.log("[!] Firebase Crashlytics HTTP factory not found: " + err);
    }

    // ----------- Optional: java.net.URL.openConnection() -----------

    try {
        const URL = Java.use("java.net.URL");

        URL.openConnection.overload().implementation = function () {
            const result = this.openConnection();
            console.log(`\n[URL.openConnection()] -> ${this.toString()}`);

            // Optional: dump stack trace for context
            const Exception = Java.use("java.lang.Exception");
            const Log = Java.use("android.util.Log");
            console.log(Log.getStackTraceString(Exception.$new()));

            return result;
        };

        console.log("[✓] URL.openConnection() hook installed");
    } catch (err) {
        console.log("[!] Failed to hook URL.openConnection(): " + err);
    }

    console.log("=== [*] All hooks attempted ===");
});
