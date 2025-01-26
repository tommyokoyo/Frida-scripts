Process.enumerateRanges({
    protection: 'r--',  // You can filter memory regions based on protection flags, e.g., 'r--' for readable sections
    coalesce: true
}).forEach(function (range) {
    console.log('Range:', range.base, '-', range.size, 'Protection:', range.protection);
});
