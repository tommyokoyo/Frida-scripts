Java.perform(function () {
    var OkHttpClientBuilder = Java.use("okhttp3.OkHttpClient$Builder");
    var Call = Java.use("okhttp3.Call");

    // Hook OkHttpClient.Builder.build()
    OkHttpClientBuilder.build.implementation = function () {
        console.log("[*] OkHttpClient.Builder.build() called");

        // call the original build
        return this.build();
    };

    // Hook OkHttp Call.execute()
    Call.execute.implementation = function () {
        console.log("[*] OkHttp Call.execute() called");

        var response = this.execute();

        // log the reponse
        console.log("[*] Response: " + response.toString());

        // return the response
        return response;
    };
});
