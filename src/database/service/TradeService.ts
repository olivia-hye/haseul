import { Chance } from "chance";
import { CardService } from "./CardService";
import * as error from "../../structures/Error";
import { TradeUpdate } from "../sql/trade/TradeUpdate";
import { MarketService } from "./MarketService";
import { UserCard } from "../../structures/player/UserCard";
import { TradeFetch } from "../sql/trade/TradeFetch";
import { UserCardService } from "./UserCardService";
import { Card } from "../../structures/card/Card";
import { StatsService } from "./StatsService";
import { PlayerService } from "./PlayerService";

export class TradeService {
  private static generateUniqueTradeId(): string {
    const chance = new Chance();
    return chance.string({
      length: 5,
      casing: "lower",
      alpha: true,
      numeric: true,
    });
  }

  public static async createNewTradeRequest(
    senderCards: UserCard[],
    recipientCards: UserCard[],
    senderId: string
  ): Promise<{ recipient: string; unique: string }> {
    const uniqueId = this.generateUniqueTradeId();
    await TradeUpdate.createTrade(
      senderId,
      recipientCards[0].ownerId,
      senderCards,
      recipientCards,
      uniqueId
    );
    return {
      recipient: recipientCards[0].ownerId,
      unique: uniqueId,
    };
  }

  public static async getTradeRequests(
    sender: string
  ): Promise<
    {
      unique: string;
      sender: string;
      recipient: string;
      senderCard: number;
      recipientCard: number;
    }[]
  > {
    return await TradeFetch.getTradesByUserId(sender);
  }

  public static async getTradeByUnique(
    unique: string
  ): Promise<
    {
      unique: string;
      sender: string;
      recipient: string;
      senderCard: number;
      recipientCard: number;
    }[]
  > {
    return await TradeFetch.getTradesByUniqueId(unique);
  }

  public static async acceptTrade(
    unique: string,
    sender: string
  ): Promise<boolean> {
    const trades = await TradeFetch.getTradesByUniqueId(unique);
    if (trades.length == 0) throw new error.InvalidTradeError(unique);

    if (sender !== trades[0].recipient)
      throw new error.NotYourTradeToAcceptError();

    for (let trade of trades) {
      if (trade.senderCard !== 0) {
        const card = await UserCardService.getUserCardById(trade.senderCard);
        await UserCardService.transferCard(trade.recipient, card);
      }
      if (trade.recipientCard !== 0) {
        const card = await UserCardService.getUserCardById(trade.recipientCard);
        await UserCardService.transferCard(trade.sender, card);
      }
    }

    const recipient = await PlayerService.getProfileByDiscordId(
      trades[0].recipient
    );
    const seller = await PlayerService.getProfileByDiscordId(trades[0].sender);
    StatsService.tradeComplete(seller, recipient);
    await TradeUpdate.deleteTrade(unique);
    return true;
  }

  public static async cancelTrade(
    unique: string,
    sender: string
  ): Promise<boolean> {
    const trades = await TradeFetch.getTradesByUniqueId(unique);
    if (trades.length == 0) throw new error.InvalidTradeError(unique);

    if (sender !== trades[0].sender && sender !== trades[0].recipient)
      throw new error.NotYourTradeToRejectError();

    await TradeUpdate.deleteTrade(unique);
    return true;
  }

  public static async cardIsForTrade(card: UserCard): Promise<boolean> {
    return await TradeFetch.cardIsForTrade(card.id);
  }
}
