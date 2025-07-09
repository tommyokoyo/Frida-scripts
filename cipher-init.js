// import hexToString from "./hex-string";

Java.perform(function () {
    let Cipher = Java.use("javax.crypto.Cipher");
    let SecretKeySpec = Java.use("javax.crypto.spec.SecretKeySpec");
    let IvParameterSpec = Java.use("javax.crypto.spec.IvParameterSpec");

    // Hook Cipher.init(int opmode, Key key, AlgorithmParameterSpec params)
    Cipher.init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec').implementation = function(opmode, key, params) {
        let algo = this.getAlgorithm();
        console.log("[*] Cipher.init() called - Algorithm: " + algo);
        console.log("    Mode: " + (opmode == 1 ? "ENCRYPT" : "DECRYPT"));
        console.log("    Key: " + bytesToHex(key.getEncoded()));
        console.log("    String Key: " + hexToString(bytesToHex(key.getEncoded())));
        
        if (Java.cast(params, IvParameterSpec)) {
            let iv = Java.cast(params, IvParameterSpec).getIV();
            console.log("    IV:  " + bytesToHex(iv));
            console.log("    String IV: " + hexToString(bytesToHex(iv)));
        }

        return this.init(opmode, key, params);
    };

    function bytesToHex(byteArray) {
        let result = '';

        for (let i = 0; i < byteArray.length; i++) {
            result += ('0' + (byteArray[i] & 0xff).toString(16)).slice(-2);
        }

        return result;
    }

    function hexToString(hex) {
    let str = '';

    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}
});
