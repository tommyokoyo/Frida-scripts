Java.perform(function () {
    var Interceptor = Java.use("okhttp3.Interceptor");
    var HttpLoggingInterceptor = Java.use("okhttp3.logging.HttpLoggingInterceptor");

    Interceptor.intercept.implementation = function (chain) {
        console.log("[*] Interceptor.intercept() called");
        var request = chain.request();
        console.log("[*] Request URL: " + request.url());
        console.log("[*] Headers: " + request.headers());

        var response = chain.proceed(request);
        console.log("[*] Response: " + response.body().string());
        return response;
    };

    HttpLoggingInterceptor.Level.BODY.valueOf.implementation = function () {
        console.log("[*] Setting logging level to BODY");
        return this.BODY;
    };
});
