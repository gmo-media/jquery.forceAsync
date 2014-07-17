if (script) {
    if (script.style !== '') {
        setStyle(script.style);
    }
    try {
        document.write(script.tag());
    }
    catch (e) {}
}
