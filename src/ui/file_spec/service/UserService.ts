export default class UserService {

    getUsers() {
        return fetch("src/ui/file_spec/data/test-users.json").then(res => res.json()).then(d => d.data);
    }

}