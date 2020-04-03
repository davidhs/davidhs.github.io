
class Map {

    constructor () {
        this._map = {};
        this._size = 0;
    }

    // Removes all mappings
    clear() {
        const keys = Object.keys(this._map);
        for (let i = 0; i < keys.length; i += 1) {
            delete this._map[keys[i]];
        }
    }

    // Returns the value associated with this key, or null.
    get(key) {
        if (!(key in this._map)) return null;

        return _this._map[key];
    }

    // Is true if this map contains no mappings.
    isEmpty() {
        return this._size === 0;
    }

    put(key, value) {
        if (key in this._map) return;

        this._map[key] = value;
        this._size += 1;
    }

    // Removes the key-value from this map, and returns the
    // associated value.  Otherwise it returns null.
    remove(key) {
        if (!(key in this._map)) return null;

        const value = this._map[key];
        delete this._map[key];

        return value;
    }

    // Returns number of key-value mappings in this map
    size() {
        return this._size;
    }
}

export { Map }
