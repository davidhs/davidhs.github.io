class GrowthQueue {
    
    constructor() {
        this.list = [];
        this.index = 0;
    }
    
    push(element) {
        this.list.push(element);
    }
    
    pop() {
        if (this.index < this.list.length) {
            let j = this.index;
            this.index += 1;
            return this.list[j];
        } else {
            return undefined;
        }
    }
    
    setList(list) {
        this.list = list;
        this.index = 0;
    }
}

export { GrowthQueue as default };
