# slackbot for letsfreckle.com

### Start using

Create a bot on https://my.slack.com/services/new/bot
Then get the access token of it and the one from freckle.
Then start the node process. In case you're using docker, just pull it from docker hub. After that the bot is ready to accept commands.

```
docker run -e FRECKLE_TOKEN=freckletoken -e SLACK_TOKEN=slacktoken  marcbachmann/freckle-slackbot
```


### Commands

You can  write to the bot you've set up to create entries on letsfreckle.com

```
login [email]   // logs in as user
projects        // lists all projects
track 3h 30min on some-project #some-tag and description
```
