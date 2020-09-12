import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { ShopService } from "../../database/service/ShopService";
import { CardService } from "../../database/service/CardService";
import moment from "moment";

export class Command extends GameCommand {
  names: string[] = ["buy"];
  usage: string[] = ["%c <pack id>"];
  desc: string =
    "Purchases a roll on a pack, which will give you one random card from that collection.";
  category: string = "shop";

  exec = async (msg: Message) => {
    console.log(`Command received - ${msg.author.id}`);
    const packName = this.prm.join(" ");
    if (!packName) {
      msg.channel.send(
        `<:red_x:741454361007357993> Please enter a pack to purchase from.`
      );
      return;
    }

    const generatedCard = await ShopService.rollPack(packName, msg.author.id);
    console.log(`Pack rolled - ${msg.author.id}`);

    const userCard = generatedCard.userCard;
    let embed = new MessageEmbed()
      .setAuthor(`You rolled the ${userCard.title} pack and got...`)
      .setDescription(
        `**${userCard.member}** ${"⭐".repeat(userCard.stars)}${
          userCard.blurb !== "" ? `\n*"${userCard.blurb}"*` : ``
        }`
      )
      .setColor("#40BD66")
      .setFooter(
        `${userCard.abbreviation + "#" + userCard.serialNumber} • Rolled by ${
          msg.author.tag
        } on ${moment().format("MMMM Do YYYY [@] HH:mm:ss")}`
      );

    if (msg.author.id == "197186779843919877") {
      const cardImage = await CardService.generateCardImageFromUserCard({
        userCard: generatedCard.userCard,
        imageData: generatedCard.imageData,
      });
      embed.attachFiles([{ name: "card.png", attachment: cardImage.image }]);
    }

    console.log(
      `Command complete - ${msg.author.id} - ${msg.createdTimestamp}`
    );
    msg.channel.send(embed);
  };
}
