import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import Chance from "chance";
import fish from "../../assets/fish.json";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["fishing"];
  users: string[] = ["197186779843919877"];

  private async generateFish(): Promise<{
    id: number;
    name: string;
    weight: number;
    weightMod: { id: number; name: string; multiplier: number };
    emoji: string;
    identifier: string;
  }> {
    const randomFish = await PlayerService.getRandomFish();

    let gender = ["male", "female"][Math.floor(Math.random() * 2)] as
      | "male"
      | "female";

    const chance = new Chance();
    const weightRaw = chance.floating({
      fixed: 2,
      min: randomFish.fish_weight - randomFish.fish_weight / 10,
      max: randomFish.fish_weight + randomFish.fish_weight / 10,
    });

    const weightMod = await PlayerService.getRandomWeightMod();

    const identifier = chance.string({ length: 5, alpha: true });
    return {
      id: randomFish.id,
      name: randomFish.fish_name,
      weight: weightRaw * weightMod.multiplier,
      weightMod: {
        id: weightMod.id,
        name: weightMod.mod_name,
        multiplier: weightMod.multiplier,
      },
      emoji: randomFish.emoji,
      identifier,
    };
  }

  exec = async (msg: Message, executor: Profile) => {
    const numberOfFish = await PlayerService.getNumberOfFishByprofile(executor);
    if (numberOfFish >= 10) {
      msg.channel.send(
        `<:red_x:741454361007357993> You're holding too many fish!`
      );
      return;
    }
    const fishingEmbed = new MessageEmbed()
      .setAuthor(`Fishing | ${msg.author.tag}`, msg.author.displayAvatarURL())
      .setDescription(
        `:fishing_pole_and_fish: You cast your line into the water and wait...`
      )
      .setFooter(`React with the fish emoji when it appears to reel in!`)
      .setColor(`#55acee`);

    const fishingMsg = await msg.channel.send(fishingEmbed);

    const chance = new Chance();
    let caughtFish = false;
    const lineBreakMultiplier = 1; // Upgradable lineBreakMultiplier to reduce chance of line breaking?
    let successfulCatches = 0;

    const interval = setInterval(async () => {
      if (fishingMsg.deleted) clearInterval(interval);

      const isFish = chance.integer({ min: 1, max: 4 }) === 2 ? true : false;
      if (isFish) {
        fishingMsg.edit(
          fishingEmbed
            .setDescription(`:warning: Something bit your line!`)
            .setColor(`#ffcd4c`)
        );
        fishingMsg.react("🐟");

        const filter = (reaction: MessageReaction, user: User) =>
          reaction.emoji.name === "🐟" && msg.author.id === user.id;
        const collector = fishingMsg.createReactionCollector(filter, {
          time: 3000,
        });
        collector.on("collect", async () => {
          clearInterval(interval);
          caughtFish = true;
          const caught = await this.generateFish();

          const xp = chance.integer({ min: 6, max: 14 });
          PlayerService.addXp(executor, xp);

          fishingMsg.edit(
            fishingEmbed
              .setDescription(
                `:${caught.emoji}: You caught a __${
                  caught.weightMod.name !== "" ? caught.weightMod.name : ""
                } ${caught.name}__!\n**Weight**: ${caught.weight.toFixed(
                  2
                )}kg\n+ **${xp}** XP`
              )
              .setColor(`#40BD66`)
              .setFooter(``)
          );
          PlayerService.createFishByDiscordId(
            executor,
            caught.id,
            caught.weight,
            caught.weightMod.id,
            caught.identifier
          );

          collector.stop("success");
        });
        collector.on("end", () => {
          if (!caughtFish) {
            successfulCatches++;
            fishingMsg.reactions.removeAll();
            if (successfulCatches === 3) {
              clearInterval(interval);
              fishingMsg.edit(
                fishingEmbed
                  .setDescription(
                    `<:pensive_fish:754587960745132094> You couldn't catch any fish.`
                  )
                  .setColor(`#D90011`)
              );
              return;
            } else {
              fishingMsg.edit(
                fishingEmbed
                  .setDescription(
                    ":fishing_pole_and_fish: You caught something, but you didn't reel in in time.\nYou continue waiting..."
                  )
                  .setColor(`#55acee`)
              );
            }
          }
        });
      }
    }, 3000);
  };
}
