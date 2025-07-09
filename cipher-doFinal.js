Java.perform(function () {
    var Cipher = Java.use("javax.crypto.Cipher");

    Cipher.doFinal.overload('[B').implementation = function(data) {
        var mode = this.getMode();
        var input = Java.array('byte', data);
        console.log("[*] Cipher.doFinal() called");
        console.log("    Input: " + bytesToHex(input));
        
        var result = this.doFinal(data);
        console.log("    Output: " + bytesToHex(result));
        return result;
    };

    function bytesToHex(byteArray) {
        return byteArray.map(function(byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
    }
});
