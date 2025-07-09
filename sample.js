Java.perform(function () {
    console.log("=== [*] Searching for okhttp3.RequestBody ===");

    try {
        var RequestBody = Java.use("okhttp3.RequestBody");
        var Buffer = Java.use("okio.Buffer");

        RequestBody.writeTo.implementation = function (sink) {
            console.log("[*] Detected okhttp3.RequestBody.writeTo");

            var buffer = Buffer.$new();
            this.writeTo(buffer);
            var data = buffer.readUtf8();
            console.log("[OkHttp Request Body] " + data);

            return this.writeTo(sink); // continue normal call
        };

        console.log("=== [*] Hooked okhttp3.RequestBody.writeTo() ===");

    } catch (err) {
        console.log("[!] Could not hook okhttp3.RequestBody.writeTo(): " + err);
    }

});
