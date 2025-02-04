Java.perform(function () {
    Process.enumerateRanges({
        protection: 'rw-',  // Filter to find readable memory regions
    }).forEach(function (range) {
        try {
            console.log('Dumping memory from:', range.base, 'Size:', range.size);
            let memoryDump = Memory.readByteArray(range.base, Math.min(range.size, 4096));  // Dump at most 4096 bytes
            console.log(hexdump(memoryDump, {
                offset: 0,
                length: 4096,
                header: true,
                ansi: true
            }));
        } catch (e) {
            console.log('Error reading memory at', range.base, ':', e.message);
        }
    });
});
