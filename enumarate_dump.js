Process.enumerateRanges({
    protection: 'r--',  // You can filter memory regions based on protection flags, e.g., 'r--' for readable sections
    coalesce: true
}).forEach(function (range) {
    console.log('Range:', range.base, '-', range.size, 'Protection:', range.protection);
    let memoryDump = Memory.readByteArray(range.base, range.size);
    console.log(hexdump(memoryDump, {
        offset: 0,
        length: range.size,
        header: true,
        ansi: false
    }));
});
