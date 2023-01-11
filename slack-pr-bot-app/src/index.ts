import { Probot, ProbotOctokit } from "probot";
const { createAppAuth, createOAuthUserAuth } = require("@octokit/auth-app");

export = (app: Probot, { getRouter }) => {
  const octokit = new ProbotOctokit({
    authStrategy: createAppAuth,
    auth: {
      type: 'app',
      appId: process.env.APP_ID,
      privateKey: process.env.PRIVATE_KEY,
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      installationId: process.env.INSTALLATION_ID
    },
    // and a logger
    log: app.log.child({ name: "my-octokit" }),
  });

  const router = getRouter("/slack-pr-bot")
  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    await context.octokit.issues.createComment(issueComment);
  });

  // Use any middleware
  router.use(require("express").static("public"));

  // Add a new route
  router.post("/hello-world", (req, res) => {


    async function getToken() {
      const token = await octokit.auth({
        installationId: process.env.INSTALLATION_ID
      })

      console.log(3, token)
      return token
    }
    const pulls = octokit.pulls.list({
      owner: process.env.OWNER,
      repo: process.env.REPO,
    })
    pulls.then(r => {
      console.log(1, r)
      res.send(r)
    }).catch(e => {
      console.log(2, e)
      res.send(e)
    })
  });


  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
