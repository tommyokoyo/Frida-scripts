Java.perform(function () {
    Java.enumerateLoadedClasses({
        onMatch: function (className) {
            if (className.includes("okhttp") || 
                className.includes("retrofit") || 
                className.includes("volley") || 
                className.includes("apache") || 
                className.includes("http") || 
                className.includes("network")) {
                console.log(className);
            }
        },
        onComplete: function () {
            console.log("=== Done ===");
        }
    });
});
