
import { assert } from './utils/utils.js';


if (window.LRUCache) {
    location.reload();
}

function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

var DO_CHECK = true;


const MAX_ARRAY_SIZE = 2 ** 32 - 1;

class LRUCache {

    constructor(capacity=10) {
        assert(capacity >= 2 && capacity <= Number.MAX_SAFE_INTEGER);
        this._capacity = capacity;
        this._size = 0;
        this._dict = {};
        this._head = null;
        this._tail = null;

        console.log(this);

        this._check();
    }

    // Ensure data invariance.
    _check() {

        if (!DO_CHECK) return;

        assert(this._size >= 0 && this._size <= this._capacity);

        if (this._size === 0) {
            assert(this._head === null);
            assert(this._tail === null);
        } else if (this._size === 1) {
            assert(this._head === this._tail);
            assert(this._tail === this._head);
        } else {
            assert(this._head.right !== null);
            assert(this._tail.left  !== null);
        }

        // Assert is always connected, and correctly counted
        if (this._size > 0) {
            let node, count;
            
            node = this._head;
            count = 1;


            while (node.right !== null) {
                assert(node !== node.left);
                assert(node !== node.right);
                node = node.right;
                count += 1;
                assert(count <= this._size, `Expected ${this._size} but got ${count}`);
            }

            assert(node === this._tail);
            assert(count === this._size, `Expected ${this._size} but got ${count}`);

            node = this._tail;
            count = 1;

            while (node.left !== null) {
                assert(node !== node.left);
                assert(node !== node.right);
                node = node.left;
                count += 1;
                assert(count <= this._size, `Expected ${this._size} but got ${count}`);
            }

            assert(node === this._head);
            assert(count === this._size, `Expected ${this._size} but got ${count}`);
        }

        // Multiplicity test

    }

    // Dropped value
    put(key, value) {

        this._check();

        if (key in this._dict) return;

        // Fastyrðing gagna

        // New node that is about to be added.
        const node = {
            key: key,
            value: value,
            left: null,
            right: null
        };

        if (this._size === 0) {
            this._check();
            this._dict[key] = node;
            this._head = node;
            this._tail = node;
            this._size += 1;
            this._check();
        } else if (this._size < this._capacity) {
            this._check();
            // Get current head
            const previous_head = this._head;

            this._dict[key] = node;
            this._head = node;

            node.right = previous_head;
            previous_head.left = node;

            this._size += 1;

            this._check();
        } else if (this._size === this._capacity) {
            this._check();

            // HANDLE TAIL
            // Throw oldest
            const previous_tail = this._tail;

            assert(previous_tail !== null);

            const new_tail = previous_tail.left;

            assert(new_tail !== null, this._tail);
            assert(new_tail.right === previous_tail);

            new_tail.right = null;
            this._tail     = new_tail;

            const previous_key   = previous_tail.key;
            const previous_value = previous_tail.value;

            delete previous_tail.key;
            delete previous_tail.value;
            delete previous_tail.left;
            delete previous_tail.right;
            delete this._dict[previous_key]

            // HANDLE HEAD


            const previous_head = this._head;

            assert(node !== previous_head);

            this._dict[key] = node;
            this._head = node;

            node.right = previous_head;
            previous_head.left = node;

            this._check();
        }

        this._check();
    }

    remove(key) {

        this._check();

        if (!(key in this._dict)) return null;

        // TODO remove key-value pair

        this._size -= 1;

        this._check();
    }

    get(key) {

        this._check();

        if (!(key in this._dict)) return null;
        if (this._size === 1) return this._head.value;

        // Move this one to the front.
    
        // Move to front

        const node_target = this._dict[key];

        if (node_target.key === this._head.key) {
            return this._head.value;
        }

        const node_head = this._head;

        

        const node_target_left = node_target.left;
        const node_target_right = node_target.right;

        const node_head_right = node_head.right;

        node_head.left         = node_target_left;
        node_target_left.right = node_head;

        node_head.right        = node_target_right;
        node_target_right.left = node_head;

        if (node_head.right === null) {
            this._tail = node_head;
        }

        node_target.left = null;
        node_target.right = node_head_right;

        this._head = node_target;

        this._check();

        return node_target.value;
    }

    resize(capacity) {
        this._check();
        this._capacity = capacity

        // TODO handle reduced capacity.
        this._check();
    }

    size() {
        this._check();
        return this._size;
    }

    capacity() {
        this._check();
        return this._capacity;
    }
}



// export { LRUCache }

function unitTest() {

    for (let j = 2; j < 100; j += 1) {
        const lru = new LRUCache(j);
        for (let i = 0; i < 1000; i += 1) {
            lru.put(~~(Math.random() * (2 * j)), Math.random());
        }
    }
}

unitTest();


