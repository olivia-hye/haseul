import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";

export class Command extends GameCommand {
  names: string[] = ["desc"];
  usage: string[] = ["%c <description>"];
  desc: string = "Sets the description on your profile.";
  category: string = "player";

  exec = async (msg: Message) => {
    let id = msg.author.id;
    let desc = this.prm.join(" ");
    let user = await PlayerService.changeProfileDescription(id, desc);

    msg.channel.send(
      `:white_check_mark: Your description was updated to:\n\`${user.new}\``
    );
  };
}
