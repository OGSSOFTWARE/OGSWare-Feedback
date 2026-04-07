import dotenv from "dotenv";
dotenv.config();

import { REST, Routes } from "discord.js";
import vouchCommand from "./vouch.js";

const commands = [vouchCommand.data.toJSON()];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Deploying slash commands...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("Commands deployed.");
  } catch (err) {
    console.error(err);
  }
})();
