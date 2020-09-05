import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { FriendService } from "../../database/service/FriendService";

export class Command extends GameCommand {
  names: string[] = ["send"];
  usage: string[] = ["%c"];
  desc: string =
    "Sends 3 :heart: to everyone on your friends list. There is a delay of 3 hours until you can use the command again.";
  category: string = "player";

  exec = async (msg: Message) => {
    const sendHearts = await FriendService.sendHeartsToFriends(msg.author.id);
    await msg.channel.send(
      `:white_check_mark: Hearts have been sent to **${sendHearts.length}** friends!`
    );
  };
}
