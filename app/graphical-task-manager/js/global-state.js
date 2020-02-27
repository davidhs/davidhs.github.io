/*
 * Move to TypeScript.
 */

import { mergeObjects } from './tools.js';



const updateStorage = (() => {

    // Attempts to update every 1000 milliseconds.
    const update_interval = 1000;
    const pending_updates = {};
    const key_last_update = {};

    let blocked = false;

    /**
     * 
     * @param {string} key 
     */
    const doUpdateStorage = (key) => {

        if (blocked) {
            return;
        }

        if (!pending_updates.hasOwnProperty(key)) {
            // No longer pending
            return;
        }

        const now = Date.now();

        const last_update = key_last_update[key];
        let duration_since_last_check = update_interval;

        if (typeof last_update === "undefined") {
            // First time
            key_last_update[key] = now;
        } else {
            // Not first time
            duration_since_last_check = now - key_last_update[key];
        }

        if (duration_since_last_check >= update_interval) {

            key_last_update[key] = now;

            const data = pending_updates[key];
            delete pending_updates[key];

            if (!blocked) {
    
                localStorage.setItem(
                    key, 
                    JSON.stringify(data)
                );
            }
        } else {

            const wait_time = update_interval - duration_since_last_check;

            setTimeout(() => {
                doUpdateStorage(key);
            }, wait_time);
        }
    };

    /**
     * 
     * @param {string} key 
     * @param {any} data 
     */
    const updateStorage = (key, data) => {

        if (blocked) {
            return;
        }

        pending_updates[key] = data;
        doUpdateStorage(key);
    };


    updateStorage.block = () => {
        blocked = true;
    };

    updateStorage.unblock = () => {
        blocked = false;
    };


    return updateStorage;
})();



/**
 * 
 */
class GlobalState {

    /**
     * 
     */
    constructor() {

        // The only data limitations is that circuits and functions are not
        // allowed.  Has to be able to be parse by JSON.parse/JSON.stringify.

        // PERSISTENT DATA

        this.data = {};
        this.local_storage_key = "" + Math.random();

        // TEMPORARY DATA
        this.actions = {};
        this.last_update = 0;
        this.local_storage_initialized = false;
    }

    merge(data) {
        const d1 = this.data;
        const d2 = data;
        const m = mergeObjects(d1, d2);
        this.data = m;
    }

    /**
     * 
     * @param {string} key 
     */
    setLocalStorageKey(key) {
        this.local_storage_key = key;
    
        if (!this.local_storage_initialized) {
            this.local_storage_initialized = true;
            const data_string = localStorage[this.local_storage_key];
    
            if (data_string && !(data_string.trim() === "")) {
                const data = JSON.parse(data_string);
                this.data = data;
            }
        }
    }

    exportJSON() {
        let obj = {
            data: this.data
        };

        return JSON.stringify(obj);
    }

    importJSON(json) {
        let obj;

        if (typeof json === "string") {
            obj = JSON.parse(json);
        } else {
            obj = json;
        }


        this.data = obj.data;

    }

    block() {
        updateStorage.block();
    }

    unblock() {
        updateStorage.unblock();
    }

    /**
     * Sets the action, or function, with name `name` and the function `fn`.
     * 
     * @param {string} name 
     * @param {*} fn 
     */
    setAction(name, fn) {
        this.actions[name] = fn;
    }

    /**
     * Performs the action `name` with parameters `params`.
     * 
     * @param {string} name 
     * @param {*} params 
     */
    do(name, params) {
        if (!this.actions.hasOwnProperty(name)) {
            throw Error(`Unsupported action ${name} with params. ${params}.`);
        }

        // Perform action.
        const result = this.actions[name](params);

        updateStorage(this.local_storage_key, this.data);
    
        // Perform action
        return result;
    }
}



export { GlobalState };

