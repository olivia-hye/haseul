import { BaseCommand } from "../structures/command/Command";
import config from "../../config.json";
import glob from "glob";
import { Message } from "discord.js";
import { promisify } from "util";
import { PlayerService } from "../database/service/PlayerService";

export class CommandManager {
  commands: BaseCommand[] = [];
  cooldown: Set<string> = new Set<string>();
  concurrence: Set<string> = new Set<string>();

  constructor() {}
  async init(): Promise<BaseCommand[]> {
    let globp = promisify(glob);
    let files = await globp(
      `${require("path").dirname(require.main?.filename)}/commands/**/*.js`
    );
    for (let file of files) {
      let current = require(file);
      if (current.Command) {
        let cmd = new current.Command();
        if (cmd.disabled) continue;
        this.commands.push({ ...cmd });
      }
    }
    return this.commands;
  }

  private getCommandByName(
    message: string,
    prefix: string
  ): BaseCommand | undefined {
    let expr = new RegExp(
      `^(${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(\\S+)`,
      "g"
    ).exec(message);
    if (expr) {
      for (let command of this.commands) {
        if (command.names.includes(expr[0].slice(prefix.length)))
          return command;
      }
    }
  }

  async handle(msg: Message): Promise<void> {
    let cmd = this.getCommandByName(msg.content.toLowerCase(), config.prefix);
    if (!cmd) return;
    if (cmd.users && cmd.users[0] !== msg.author.id) {
      msg.channel.send(
        `<:red_x:741454361007357993> You don't have access to that command.`
      );
      return;
    }
    if (this.cooldown.has(msg.author.id)) {
      await msg.channel.send(
        "<:red_x:741454361007357993> Please wait a couple seconds before using another command."
      );
      return;
    }
    if (this.concurrence.has(msg.author.id)) {
      msg.channel.send(
        `<:red_x:741454361007357993> Wait for the current command to finish before using another.`
      );
      return;
    }

    try {
      this.cooldown.add(msg.author.id);
      //this.concurrence.add(msg.author.id);
      setTimeout(() => {
        this.cooldown.delete(msg.author.id);
      }, 1500);

      const profile = await PlayerService.getProfileByDiscordId(
        msg.author.id,
        true
      );
      await cmd.run(msg, profile).then(() => {
        //this.concurrence.delete(msg.author.id);
      });
    } catch (e) {
      msg.channel.send(`<:red_x:741454361007357993> ${e.message}`);
      if (!e.isClientFacing) console.log(`${e.message}\n${e.stack}`);
    }
  }
}
