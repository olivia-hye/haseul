import { DBClass, DB } from "../..";
import { UserCard } from "../../../structures/player/UserCard";

export class TradeUpdate extends DBClass {
  private static async createTradeRow(
    senderId: string,
    senderCardId: number,
    recipientId: string,
    recipientCardId: number,
    unique: string
  ): Promise<number> {
    const query = await DB.query(
      `INSERT INTO trade_request (unique_id, sender_id, recipient_id, sender_card, recipient_card) VALUES (?, ?, ?, ?, ?);`,
      [unique, senderId, recipientId, senderCardId, recipientCardId]
    );
    return query.insertId;
  }

  public static async createTrade(
    senderId: string,
    recipientId: string,
    senderCards: UserCard[],
    recipientCards: UserCard[],
    unique: string
  ): Promise<boolean> {
    if (senderCards.length > recipientCards.length) {
      for (let i = 0; i < senderCards.length; i++) {
        await this.createTradeRow(
          senderId,
          senderCards[i]?.userCardId || 0,
          recipientId,
          recipientCards[i]?.userCardId || 0,
          unique
        );
      }
    } else {
      for (let i = 0; i < recipientCards.length; i++) {
        await this.createTradeRow(
          senderId,
          senderCards[i]?.userCardId || 0,
          recipientId,
          recipientCards[i]?.userCardId || 0,
          unique
        );
      }
    }
    return true; // what to return here ?
  }

  public static async deleteTrade(unique: string): Promise<boolean> {
    const query = await DB.query(
      `DELETE FROM trade_request WHERE unique_id=?;`,
      [unique]
    );
    return true;
  }
}
