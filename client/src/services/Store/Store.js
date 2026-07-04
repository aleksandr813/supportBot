class Store {
    constructor() {
        this.data = {
            guid: '',
            token: '',
        };
    }

    setUserParams(guid, token) {
        this.guid = guid;
        this.token = token;
    }

    getUserParams() {
        return {
            guid: this.guid,
            token: this.token,
        }
    }

    set(name, value) {
        this.data[name] = value;
    }
    
    get(name) {
        return this.data[name];
    }
}

export default Store;