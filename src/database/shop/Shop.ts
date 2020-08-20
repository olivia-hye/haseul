import { Pack as PackStruct } from "../../structures/shop/Pack";
import { Pack } from "../../entities/shop/Pack";
import * as error from "../../structures/Error";
import { Collection } from "../../entities/card/Collection";
import { Card } from "../../entities/card/Card";
import { User } from "../../entities/player/User";
import Chance from "chance";
import { UserCard } from "../../entities/card/UserCard";

export class ShopService {
  private static cleanMention(m: string): string {
    return m.replace(/[\\<>@#&!]/g, "");
  }

  public static async getPackByID(id: number) {
    let pack = Pack.findOne({ id });
  }

  public static async getAllPacks(page: number): Promise<Pack[]> {
    let pack = await Pack.find({
      where: { active: true },
      skip: page * 10 - 10,
      take: 9,
      relations: ["collection", "collection.serialNumber"],
    });
    let packList = [];
    for (let p of pack) {
      let cardList = await Card.find({
        where: { collection: p.collection },
      });

      if (cardList.length > 0) packList.push(p);
    }
    return packList;
  }

  public static async newUserCard(card: Card, u: User): Promise<UserCard> {
    let chance = new Chance();

    let user_card = UserCard.create();
    user_card.card = card;
    user_card.discord_id = u.discord_id;
    user_card.hearts = 0;
    user_card.stars = chance.weighted(
      [1, 2, 3, 4, 5, 6],
      [70, 30, 20, 5, 2, 0.15]
    );
    user_card.serialNumber = card.collection.serialNumber.serialNumber + 1;
    user_card.save();
    card.collection.serialNumber.serialNumber += 1;
    card.collection.serialNumber.save();
    return user_card;
  }

  public static async rollPack(
    pack_id: number,
    m: string
  ): Promise<{ card: Card; usercard: UserCard; user: User; pack: Pack }> {
    if (isNaN(pack_id)) throw new error.NoPackIDError();
    let user = await User.findOne({ where: { discord_id: m } });

    let pack = await Pack.findOne({
      relations: ["collection", "collection.serialNumber"],
      where: { id: pack_id },
    });
    if (!pack) throw new error.InvalidPackError();
    if (!pack.active) throw new error.ExpiredPackError();

    if (pack.price > user!.coins) throw new error.NotEnoughCoinsError();

    let cardListRepo = await Card.getRepository().find({
      relations: ["collection", "collection.serialNumber"],
      where: { collection: { id: pack.collection.id } },
    });

    let count = cardListRepo.length;
    let cardList = cardListRepo;
    if (count < 1) throw new error.InvalidPackError();

    let chance = new Chance();
    let chances = [];
    for (let card of cardList) {
      let adjustedRarity =
        card.rarity > 3 ? card.rarity * 3.36 : card.rarity * 0.16;
      chances.push(adjustedRarity);
    }
    let randomCard = chance.weighted(cardList, chances);

    let newCard = await this.newUserCard(randomCard, user!);

    user!.coins = +user!.coins - +pack.price;
    user?.save();
    return { card: randomCard, usercard: newCard, user: user!, pack };
  }
}
