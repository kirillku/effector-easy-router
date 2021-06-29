# `effector-easy-router`

A declarative router for [`effector`](https://effector.dev/) and [`react`](https://reactjs.org/). It is inspired by [`react-router-dom`](https://reactrouter.com/web) and [effector gates](https://effector.dev/docs/api/effector-react/gate). Routes are independent from each other and do not rely on React tree. Url manipulations are fully abstracted out, you only need to set path when creating a route.

Example: [CodeSandbox](https://codesandbox.io/s/effector-easy-router-xx688)

```tsx
const HomeRoute = createRoute("/");
const UsersRoute = createRoute("/users");
const UserRoute = createRoute(`${UsersRoute.path}/:userId`);

const loadUsersFx = createEffect();

const $users = restore(loadUsersFx.doneData, []);

sample({ clock: UsersRoute.open, target: loadUsersFx });

const $currentUser = combine($users, UserRoute.match, (users, match) =>
  users.find((user) => user.id === match.params.userId)
);

const UsersPage = () => {
  const list = useList($users, ({ name, id }) => (
    <li>
      <Link to={UserRoute} params={{ userId: id }}>
        {name}
      </Link>
    </li>
  ));

  return (
    <>
      <h1>List of users</h1>
      {list}
    </>
  );
};

const UserPage = () => {
  const user = useStore($currentUser);

  if (!user) {
    return null;
  }

  const { name, avatar, email } = user;

  return (
    <>
      <h1>{name}</h1>
      <img src={avatar} alt={name} />
      <a href={`mailto:${email}`}>{email}</a>
      <hr />
      <Link to={UsersRoute}>Back</Link>
    </>
  );
};

const App = () => {
  return (
    <>
      <nav>
        <Link to={HomeRoute}>Home</Link>
        <Link to={UsersRoute}>Users</Link>
      </nav>
      <Switch>
        <HomeRoute>
          <h1>Hello</h1>
        </HomeRoute>
        <UsersRoute>
          <UsersPage />
        </UsersRoute>
        <UserRoute>
          <UserPage />
        </UserRoute>
      </Switch>
    </>
  );
};
```

## `Route`

`Route` could be created using `createRoute`.

```tsx
const MyRoute = createRoute("/my/path");
const RelativeRoute = createRoute(`${MyRoute.path}/something/else`);
const RouteWithParams = createRoute<"id">("/users/:id");
```

`createRoute` return React element, that you can use to conditionally render content.

```tsx
<MyRotute>Page content</MyRoute>
// Or
<MyRoute exact>Will render only when exact match</MyRoute>
```

### `Route.match: Store<Match<PathParamKeys> | null>`

Store with current match of the route. Similar with [`Gate.state`](https://effector.dev/docs/api/effector-react/gate#state).

```
url                  RouteWithParams.match
/users/abc           { params: { id: "abc" }, isExact: true }
/users/abc/friends   { params: { id: "abc" }, isExact: false }
/somewhere/else      null
```

### `Route.open: Event<Match<PathParamKeys>>`

Triggers when route is matched. Similar with [`Gate.open`](https://effector.dev/docs/api/effector-react/gate#open).

### `Route.close: Event<null>`

Triggers when route is leaving the route. Similar with [`Gate.close`](https://effector.dev/docs/api/effector-react/gate#close).

### `Route.status: Store<boolean>`

Boolean store which shows if given route is currently matched. Similar with [`Gate.status`](https://effector.dev/docs/api/effector-react/gate#status).

### `Route.navigate: Event<void | NavigateOptions<PathParamKeys>>`

Event to navigate to the route. Accepts `NavigateOptions`.

```tsx
RouteWithParams.navigate(
  // params?: Partial<PathParams<PathParamKeys>>;
  params: {id: "xyz"},
  // search?: boolean | string;
  search: "query=newValue", // will update value
  search: true, // will keep the current search value
  // hash?: boolean | string;
  hash: "hello", // will update value
  hash: true, // will keep the current hash value
  // method?: HistoryMethod;
  method: "push", // default, will push to the history
  method: "replace", // will replace the location in the history
)
```

You don't need to provide all the params if some of them are already in the url.

```tsx
cosnt LongUserRoute = createRoute("/:locale/teams/:teamId/users/:userId");
// current url: /en/teams/123/users/abc
LongUserRoute.navigate({params: {userId: "xyz"}})
// new url: /en/teams/123/users/xyz
```

## `Link`

Renders `a` tag, accepts `NavigateOptions` as props.

```tsx
<Link to={LongUserRoute} params={{ teamId: "456", userId: "abc" }}>
  Petya
</Link>
```

## `Redirect`

Once rendered, it will navigate to a new location. By default it will replace the location in the history. You can pass to `Redirect` same props as to `Link`.

```tsx
if (!hasAccess) {
  return <Redirect to={HomeRoute} />;
}
```

## `CurrentRoute`

`CurrentRoute` is a helper for such cases when you want to only update `search` or `hash`. It implements only one event from the original `Route`. It's `CurrentRoute.navigate(options: NavigateOptions)`.

```tsx
CurrentRoute.navigate({search: "query=newValue", hash: "hello"})
// Or using `Link`
<Link to={CurrentRoute} search="query=newValue" hash="hello">Update query</Link>
```

## `Switch`

Renders the first matched route. If you provide component which is not `Route`, it will be treated as match. It could be usefull to render 404 pages.

```tsx
<Switch>
  <UsersRoute exact>List of users</UsersRoute>
  <UserRoute>User info</UserRoute>
  <NotFoundPage />
</Switch>
```

## `$search: Store<string>`

A store with current `search`.

## `$hash: Store<string>`

A store with curernt `hash`
