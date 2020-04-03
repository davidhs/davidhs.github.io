function getMousePosition(el, evt) {
    const rect = el.getBoundingClientRect();

    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

export { getMousePosition };
