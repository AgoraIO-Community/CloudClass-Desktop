# Create Vanilla JS App 🌴🌴🌴

# A very simple vanilla js boilerplate

- Includes webpack HMR
- Webpack 4
- Es6 / Babel
- Webpack CSS loader / Style loader

Please keep in mind, This is a helper for me to tinker with ideas and start projects from - I've tried to keep it as clean as possible. Add your own packages to suit your own workflow. The one thing I've ommited is `package-lock.json` generation. But you can add this back in by removing `.npmrc` before running `npm i`

### First

Install deps from project root `yarn` or `npm i`

### Start development server with:

`yarn start:dev` or `npm run start:dev`

It's possible to use a different port by specifying this first like so: 

`CVA_PORT=7788 yarn start:dev` to start with port 7788. Same for npm just include `CVA_PORT=7788` at the beginning.

### Build for production

`yarn build` or `npm run build`

### Ways you may add to this

+ Add jsx and react - Or just use create react app instead!
+ Add a .env for project specific environment values