Java.perform(function () {
    let TelephonyManager = Java.use("android.telephony.TelephonyManager");

    TelephonyManager.getSimState.overload().implementation = function () {
        console.log('[-] Get Sim state called.');
        return 5; //SIM_STATE_READY
    }

    TelephonyManager.getSimState.overload('int').implementation = function () {
        console.log('[-] Get Sim state called.');
        return 5; //SIM_STATE_READY
    }
});