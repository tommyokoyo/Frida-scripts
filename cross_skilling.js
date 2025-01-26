
/*
Module.enumerateExports("libc.so").forEach(function (e) {
    if (e.name === 'fopen' || e.name === 'write') {
        console.log("Hurray, found it: " + e.name);
    }
});


Interceptor.attach(Module.findExportByName("libc.so", "fopen"), {
    onEnter: function(args) {
        let Memory_variable = Memory.readCString(args[0]);
        console.log("[-] Found path: " + Memory_variable);
        
        if (paths_checked.includes(Memory_variable)) {
            console.log('[-] Changing value of: ' + Memory.readCString(args[0]));
            console.log('[-] Mode passed: ' + Memory.readCString(args[1]));
            Memory.writeUtf8String(args[0], "/just/another/path");
            console.log('[-] Changed value is: ' + Memory.readCString(args[0]));
        }
          
    },
    onLeave: function(retval){
        console.log("Return value is: " + retval);
    }
});
/*
        if (args == '@') {
            console.log("Changing the value of: " + result);
            return true;
        } else {
            console.log("Returned value: " + result);
        }
            */


Java.perform(function() {
    let String = Java.use("java.lang.String");
    String.contains.implementation = function(args) {

        console.log("String passed is: " + args);
        if (args == '$') {
            console.log("Changing the return value of: " + args);
            return true;
        } else {
            // call the original String.contains(args)
            let result = this.contains(args);
            console.log("String.contains result: " + result);
            return result;
        }
        
        
    }
  });