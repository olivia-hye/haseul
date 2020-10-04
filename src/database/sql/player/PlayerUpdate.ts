import { DB, DBClass } from "../../index";

export class PlayerUpdate extends DBClass {
  public static async createNewProfile(discord_id: string): Promise<void> {
    await DB.query(
      `INSERT INTO user_profile (discord_id, coins) VALUES (?, ${300});`,
      [discord_id]
    );
  }
  public static async changeDescription(
    discord_id: string,
    description: string
  ): Promise<void> {
    await DB.query(`UPDATE user_profile SET blurb=? WHERE discord_id=?;`, [
      description,
      discord_id,
    ]);
  }
  public static async addCoins(
    discord_id: string,
    amount: number
  ): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET coins=coins+? WHERE discord_id=?;`,
      [amount, discord_id]
    );
  }
  public static async removeCoins(
    discord_id: string,
    amount: number
  ): Promise<void> {
    await DB.query(`UPDATE user_profile SET coins=coins-? WHERE discord_id=?`, [
      amount,
      discord_id,
    ]);
  }
  public static async addHearts(
    discord_id: string,
    amount: number
  ): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET hearts=hearts+? WHERE discord_id=?;`,
      [amount, discord_id]
    );
  }
  public static async removeHearts(
    discord_id: string,
    amount: number
  ): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET hearts=hearts-? WHERE discord_id=?`,
      [amount, discord_id]
    );
  }
  public static async setHeartSendTimestamp(
    discord_id: string,
    time: number
  ): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET hearts_last=? WHERE discord_id=?;`,
      [time, discord_id]
    );
  }
  public static async setHeartBoxTimestamp(
    discord_id: string,
    time: number
  ): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET heart_box_last=? WHERE discord_id=?;`,
      [time, discord_id]
    );
  }
  public static async giveBadge(
    discord_id: string,
    badge_id: number
  ): Promise<void> {
    await DB.query(
      `INSERT INTO user_badge (discord_id, badge_id) VALUES (?, ?);`,
      [discord_id, badge_id]
    );
  }

  public static async removeBadge(
    discord_id: string,
    badge_id: number
  ): Promise<void> {
    await DB.query(
      `DELETE FROM user_badge WHERE discord_id=? AND badge_id=?;`,
      [discord_id, badge_id]
    );
  }

  public static async setOrphanTimestamp(
    discord_id: string,
    time: number
  ): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET last_orphan=? WHERE discord_id=?;`,
      [time, discord_id]
    );
  }
  public static async setMissionTimestamp(
    discord_id: string,
    time: number
  ): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET mission_last=? WHERE discord_id=?;`,
      [time, discord_id]
    );
  }
  public static async setDailyTimestamp(
    discord_id: string,
    time: number
  ): Promise<void> {
    await DB.query(`UPDATE user_profile SET daily_last=? WHERE discord_id=?;`, [
      time,
      discord_id,
    ]);
  }

  public static async createFish(
    discord_id: string,
    fish: number,
    weight: number,
    weightModId: number,
    identifier: string
  ): Promise<void> {
    await DB.query(
      `INSERT INTO fish (owner_id, fish_id, fish_weight, weight_mod, identifier) VALUES (?, ?, ?, ?, ?);`,
      [discord_id, fish, weight, weightModId, identifier]
    );
  }

  public static async giveReputation(
    sender_id: string,
    receiver_id: string
  ): Promise<void> {
    await DB.query(
      `INSERT INTO reputation (sender_id, receiver_id) VALUES (?, ?);`,
      [sender_id, receiver_id]
    );
  }

  public static async removeReputation(
    sender_id: string,
    receiver_id: string
  ): Promise<void> {
    await DB.query(
      `DELETE FROM reputation WHERE sender_id=? AND receiver_id=?;`,
      [sender_id, receiver_id]
    );
  }

  public static async addXp(discord_id: string, amount: number): Promise<void> {
    await DB.query(`UPDATE user_profile SET xp=xp+? WHERE discord_id=?;`, [
      amount,
      discord_id,
    ]);
  }

  public static async makeFishTrophy(id: string): Promise<void> {
    await DB.query(`UPDATE fish SET trophy_fish=true WHERE identifier=?;`, [
      id,
    ]);
  }

  public static async clearFish(ownerId: string): Promise<void> {
    await DB.query(`DELETE FROM fish WHERE owner_id=? AND trophy_fish=false;`, [
      ownerId,
    ]);
  }

  public static async restrictUser(discordId: string): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET restricted=true WHERE discord_id=?;`,
      [discordId]
    );
  }

  public static async unrestrictUser(discordId: string): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET restricted=false WHERE discord_id=?;`,
      discordId
    );
  }
}
