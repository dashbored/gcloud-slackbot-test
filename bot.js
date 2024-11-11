const { Botkit } = require('botkit');
const {
  SlackAdapter,
} = require('botbuilder-adapter-slack');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');


/**
 * Returns the secret string from Google Cloud Secret Manager
 * @param {string} name The name of the secret.
 * @return {Promise<string>} The string value of the secret.
 */
async function accessSecretVersion(name) {
    const client = new SecretManagerServiceClient();
    const projectId = process.env.PROJECT_ID;
    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/${name}/versions/1`,
    });
  
    // Extract the payload as a string.
    const payload = version.payload.data.toString('utf8');
  
    return payload;
  }
  

  /**
 * Function to initialize bot.
 */
async function botInit() {
    const adapter = new SlackAdapter({
      clientSigningSecret: await accessSecretVersion('client-signing-secret'),
      botToken: await accessSecretVersion('bot-token'),
    });
  
    const controller = new Botkit({
      adapter: adapter,
    });
  
    controller.ready(() => {
      controller.hears(
        ['hello', 'hi', 'hey'],
        ['message', 'direct_message'],
        async (bot, message) => {
          await bot.reply(message, 'Meow. :smile_cat:');
        }
      );
    });
}
  
botInit();