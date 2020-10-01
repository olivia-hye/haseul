import { DBClass, DB } from "../..";
import { PlayerService } from "../../service/PlayerService";

export class FriendUpdate extends DBClass {
  public static async sendFriendRequest(
    senderId: string,
    friendId: string
  ): Promise<void> {
    await DB.query(`INSERT INTO friend (sender_id, friend_id) VALUES (?, ?);`, [
      senderId,
      friendId,
    ]);
  }

  public static async acceptFriendRequest(
    senderId: string,
    friendId: string
  ): Promise<void> {
    await DB.query(
      `UPDATE friend SET confirmed=true WHERE (sender_id=? AND friend_id=?) OR (sender_id=? AND friend_id=?);`,
      [senderId, friendId, friendId, senderId]
    );
  }

  public static async removeFriend(
    senderId: string,
    friendId: string
  ): Promise<void> {
    await DB.query(
      `DELETE FROM friend WHERE (sender_id=? AND friend_id=?) OR (sender_id=? AND friend_id=?);`,
      [senderId, friendId, friendId, senderId]
    );
  }

  public static async sendHearts(
    senderId: string,
    friendIds: string[]
  ): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET hearts=hearts+1 WHERE discord_id IN (?);`,
      [friendIds]
    );

    const time = Date.now();
    const sendQuery = friendIds.map((f) => {
      return `(${DB.connection.escape(senderId)}, ${DB.connection.escape(
        f
      )}, ${time})`;
    });
    await DB.query(
      `INSERT INTO friend_heart (sender_id, friend_id, time) VALUES ${sendQuery.join(
        ", "
      )};`
    );
  }
}
