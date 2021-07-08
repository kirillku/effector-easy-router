const USERS = [
  { id: "1", slug: "boris", name: "Boris", age: 5 },
  { id: "2", slug: "john", name: "John", age: 3 },
  { id: "3", slug: "barsik", name: "Barsik", age: 2 },
  { id: "4", slug: "dusya", name: "Dusya", age: 6 },
];

const wait = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchUsers = () => wait().then(() => USERS);
