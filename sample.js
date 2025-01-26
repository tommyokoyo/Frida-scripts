Interceptor.attach(Module.findExportByName("libc.so.6", "write"), {
    onEnter: function (args) {
        // `args[0]`: file descriptor
        // `args[1]`: pointer to the buffer
        // `args[2]`: number of bytes to write

        // File descriptor
        var fd = args[0].toInt32();

        // Buffer and size
        var buffer = args[1];
        var count = args[2].toInt32();

        // Only intercept writes to stdout (fd 1) for simplicity
        if (fd === 1) {
            var content = Memory.readUtf8String(buffer, count);
            console.log("Intercepted write syscall:");
            console.log("FD: " + fd + ", Content: \"" + content + "\", Count: " + count);
        }
    }
});
