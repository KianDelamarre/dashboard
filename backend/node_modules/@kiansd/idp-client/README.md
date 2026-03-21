# idp-client

## **WARNING** this is not complete and should not be used for any serious auth!

small idp-client library written for node.js to go with my idp-server, relying on JSON Web Tokens

install and run idp-server

make sure any apps you wish to secure can access idp-server

use this library to easily add auth and SSO to your apps with 15 lines of code

idp-server will be available as a prebuilt docker image soon, but for now you can build using the dockerfile included

```
import { createIdpClient, createLoginController,createAuthMiddleware, createRequestNewAccessTokencontroller,createLogoutController, getPublicKeyFromIdp } from '@kiansd/idp-client';

const idp_url = process.env.IDP_URL
const publicKey = await getPublicKeyFromIdp(idp_url)
const idp = createIdpClient({
  baseUrl: idp_url,
  publicKey: publicKey,
});

app.post('/refresh', createRequestNewAccessTokencontroller({ client: idp }));
app.post('/login', createLoginController({ client: idp, cookieOptions}));

app.use(createAuthMiddleware({ client: idp }));
```

Then just configure the rest of your endpoints below

not all auth functionality is enabled yet, need to configure logout and register
