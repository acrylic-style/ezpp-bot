# ezpp-bot
A GitHub bot for ezpp repositories.

## Commands
These commands can be used only by collaborators or owners.
- `@ezpp-bot addentry [major] <category;message>` - add a changelog entry manually
- `@ezpp-bot removeentry <category;message>` - remove a changelog entry manually
- `@ezpp-bot setgroup <group name>` - set the group name for the repository (Required to generate changelogs)
- `@ezpp-bot removegroup` - remove the group for the repository (no changelogs will not be generated if group is not set)

## Setup
1. Create a label like this
  ![](https://user-images.githubusercontent.com/19150229/112945401-30241300-916f-11eb-8e68-1a28ea5936dc.png)
    - the name should be: `type: <anything>`
    - the description will be the category when generating changelog entry.
    - Also, you can create a label named `major` to mark PR as major update.
2. Download the private key from GitHub App settings and place it in the ezpp-bot directory
3. Setup .env file
    - `APP_ID` - the GitHub App ID that can be obtained from GitHub App settings.
    - `WEBHOOK_SECRET` - anything (like password), and change/set it in GitHub App settings > Webhook secret (optional).
    - `WEBHOOK_PROXY_URL` - Go to https://smee.io/ and click **Start a new channel**. Set `WEBHOOK_PROXY_URL` to the URL that you are redirected to.
    - `CHANGELOG_PATH` - Custom changelog.json path.
4. `yarn -D`
5. `npm start` (You can set the env `ENV` to `development` to bypass repository owner restriction.)
