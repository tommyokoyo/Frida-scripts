function hexToString(hex) {
    let str = '';

    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    console.log(str)
    // return str;
}

export default hexToString;