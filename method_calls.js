Java.perform(function () {
    var Runtime = Java.use("java.lang.Runtime");
    
    // Get all methods in the Runtime class
    var methods = Object.getOwnPropertyNames(Runtime).filter(function(prop) {
        return typeof Runtime[prop].overload === 'function'; // Filter only for methods
    });

    // Hook each method
    methods.forEach(function(methodName) {
        var method = Runtime[methodName];

        // Hook for each overload of the method
        method.overloads.forEach(function(overload) {
            overload.implementation = function () {
                // Log method name and arguments
                var args = Array.from(arguments);
                if (methodName !== "hashCode" && methodName !== "getClass" && methodName !== "equals" && methodName !== "clone" && methodName !== "internalClone") {
                    console.log("[*] Called method: " + methodName + " with arguments: " + JSON.stringify(args));
                    // Call the original method
                    return overload.apply(this, arguments);   
                }    
                // Call the original method
                return overload.apply(this, arguments);
            };
        });
    });
});
