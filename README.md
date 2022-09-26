# Sing-me a Song


## Environment Variables

#### Front-end

```
REACT_APP_API_BASE_URL = API URL
```

#### Back-end

```
#.env
DATABASE_URL = postgres://YourUserName:YourPassword@YourHostname:5432/YourDatabaseName
NODE_ENV = test || prod
PORT = 5000 || other port
```

#### .env.test

```
#.env.test
DATABASE_URL = postgres://YourUserName:YourPassword@YourHostname:5432/YourTestDatabaseName
```

## Commands Tests

#### Front-end

```
 npm i

 npx cypress open

```

#### Back-end

```
 npm i

 npm test:unit || npm test:integration

```

